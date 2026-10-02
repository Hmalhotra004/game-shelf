import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from "node:crypto";

import {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  exchangeRefreshTokenForAuthTokens,
  type AuthTokensResponse,
} from "psn-api";

const TOKENS_KEY = "psn:tokens";
const LOCK_KEY = "psn:tokens:lock";
const EXPIRY_BUFFER_MS = 60_000;
const LOCK_TTL_MS = 30_000;
const LOCK_WAIT_STEP_MS = 500;
const LOCK_WAIT_STEPS = 20;

type Stored = {
  tokens: AuthTokensResponse;
  accessExpiresAt: number;
  refreshExpiresAt: number;
};

let memory: Stored | null = null;
let inflight: Promise<AuthTokensResponse> | null = null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const accessValid = (s: Stored | null): s is Stored =>
  !!s && Date.now() < s.accessExpiresAt - EXPIRY_BUFFER_MS;

const refreshValid = (s: Stored | null): s is Stored =>
  !!s && Date.now() < s.refreshExpiresAt - EXPIRY_BUFFER_MS;

/* ---------- encryption at rest (AES-256-GCM) ---------- */
// Generate a key with: openssl rand -base64 32

function getKey(): Buffer {
  const key = Buffer.from(process.env.PSN_TOKEN_ENC_KEY ?? "", "base64");
  if (key.length !== 32) {
    throw new Error("PSN_TOKEN_ENC_KEY must be 32 bytes, base64 encoded");
  }
  return key;
}

function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64");
}

function decrypt(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    buf.subarray(0, 12),
  );
  decipher.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([
    decipher.update(buf.subarray(28)),
    decipher.final(),
  ]).toString("utf8");
}

/* ---------- redis storage ---------- */

async function readRedis(): Promise<Stored | null> {
  try {
    const raw = await redis.get(TOKENS_KEY);
    return raw ? (JSON.parse(decrypt(raw)) as Stored) : null;
  } catch (err) {
    // Redis down, bad key, or corrupted payload: treat as an empty cache
    logger.warn({ err }, "PSN token cache read failed");
    return null;
  }
}

async function save(tokens: AuthTokensResponse): Promise<Stored> {
  const now = Date.now();
  const stored: Stored = {
    tokens,
    accessExpiresAt: now + tokens.expiresIn * 1000,
    refreshExpiresAt: now + tokens.refreshTokenExpiresIn * 1000,
  };
  memory = stored;

  try {
    // Entry expires together with the refresh token
    const ttl = Math.max(1, Math.floor(tokens.refreshTokenExpiresIn));
    await redis.set(TOKENS_KEY, encrypt(JSON.stringify(stored)), {
      expiration: { type: "EX", value: ttl },
    });
  } catch (err) {
    logger.warn({ err }, "PSN token cache write failed");
  }
  return stored;
}

/* ---------- lock (owner-checked release) ---------- */

const RELEASE_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`;

async function acquireLock(lockId: string): Promise<boolean> {
  try {
    return (
      (await redis.set(LOCK_KEY, lockId, {
        expiration: { type: "PX", value: LOCK_TTL_MS },
        condition: "NX",
      })) === "OK"
    );
  } catch (err) {
    // Redis unavailable: proceed without a lock rather than blocking auth
    logger.warn({ err }, "PSN lock unavailable, proceeding without it");
    return true;
  }
}

async function releaseLock(lockId: string) {
  try {
    await redis.eval(RELEASE_SCRIPT, { keys: [LOCK_KEY], arguments: [lockId] });
  } catch {
    // Lock expires on its own via TTL
  }
}

/* ---------- auth flows ---------- */

async function loginWithNpsso(): Promise<Stored> {
  const npsso = process.env.PSNNPSO;
  if (!npsso) throw new Error("PSNNPSO is not set");

  try {
    const accessCode = await exchangeNpssoForAccessCode(npsso);
    return await save(await exchangeAccessCodeForAuthTokens(accessCode));
  } catch (err) {
    // The NPSSO expires roughly every 60 days. Hook an alert onto this log line.
    logger.error({ err }, "PSN NPSSO login failed: rotate the NPSSO");
    throw err;
  }
}

async function renew(): Promise<AuthTokensResponse> {
  // Another instance may have refreshed already
  const fromRedis = await readRedis();
  if (accessValid(fromRedis)) {
    memory = fromRedis;
    return fromRedis.tokens;
  }

  const lockId = randomUUID();
  const gotLock = await acquireLock(lockId);

  if (!gotLock) {
    // Someone else is refreshing: wait for their result
    for (let i = 0; i < LOCK_WAIT_STEPS; i++) {
      await sleep(LOCK_WAIT_STEP_MS);
      const s = await readRedis();
      if (accessValid(s)) {
        memory = s;
        return s.tokens;
      }
    }
    logger.warn("Timed out waiting for PSN token refresh, refreshing locally");
  }

  try {
    const current = fromRedis ?? memory;

    if (refreshValid(current)) {
      try {
        const next = await exchangeRefreshTokenForAuthTokens(
          current.tokens.refreshToken,
        );
        return (await save(next)).tokens;
      } catch (err) {
        logger.warn(
          { err },
          "PSN refresh token rejected, falling back to NPSSO",
        );
      }
    }

    return (await loginWithNpsso()).tokens;
  } finally {
    if (gotLock) await releaseLock(lockId);
  }
}

export async function getPSNAuthorization(): Promise<AuthTokensResponse> {
  if (accessValid(memory)) return memory.tokens;

  // Concurrent callers in this process share one renewal
  inflight ??= renew().finally(() => {
    inflight = null;
  });

  return inflight;
}
