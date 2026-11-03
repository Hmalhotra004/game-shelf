# GameShelf API Conventions

## Stack

The supplied API uses:

- Express 5
- TypeScript
- Drizzle ORM
- PostgreSQL
- Zod / shared schemas
- Better Auth
- Socket.IO
- Redis
- pg-boss
- Pino
- Axios
- `uuid` (UUIDv7 ID generation)
- `compression`
- `helmet`
- `cors`
- `cookie-parser`
- Resend and Nodemailer (email delivery)

## Structure

```text
src/
├── controllers/
├── db/
├── jobs/
├── lib/
├── middlewares/
├── router/
├── socket/
└── types/
```

## Feature organization

Controllers are grouped by feature:

```text
collection
completion
list
playthroughs
psn
steam
steamGridDB
igdb
stats
user
auth
mobile (app version)
```

Keep new controller code inside the appropriate feature directory.

## Router/controller separation

Routers define HTTP endpoints and middleware composition.

Controllers implement request handling/business operations.

Example conceptual flow:

```text
router.patch(...)
    ↓
authenticateUser
    ↓
feature ownership middleware
    ↓
validateData(schema)
    ↓
controller
```

Do not put large business implementations directly in router definitions when an established controller exists.

## Authentication

Authentication middleware is a dedicated API concern.

Protected feature endpoints use `authenticateUser`.

Feature-specific ownership middleware exists for resources such as collection, completion, list, playthrough, and user.

Reuse these checks.

## Validation

Validation is shared through `@repo/schemas`.

Do not create a second incompatible schema inside a controller if the shared package already defines the request contract.

## Database

The API combines schema and relation definitions when constructing Drizzle.

Local DB uses node-postgres.

Production uses Neon serverless.

## External services

Provider-specific integrations include:

```text
src/lib/igdb
src/lib/PsnApiAuth.ts
src/lib/steam.ts
src/lib/...
```

Controllers for those providers live under corresponding feature folders.

## Startup and infrastructure

The API startup sequence currently:

1. Connects Redis.
2. Verifies the database connection with `SELECT 1`.
3. Starts pg-boss.
4. Registers background jobs.
5. Starts the HTTP server.

Redis is created in `src/lib/redis.ts` using `REDIS_URL`, with a localhost fallback for development. pg-boss uses the environment-specific database connection string.

The Express app also configures CORS, request logging, Helmet, compression, cookie parsing, JSON parsing, Better Auth's Node handler, and the API router.

Use the existing startup/shutdown and logging patterns rather than starting infrastructure from individual controllers.

## Jobs

The API has a job layer under `src/jobs`, backed by `pg-boss`.

Current registered jobs include:

- Resolve PlayStation NP communication IDs for a collection (`resolveNPCId`).
- Resolve Steam App IDs (and associated DLC IDs) for a collection (`resolveSteamAppId`).

Queue creation/registration is centralized in `src/jobs/index.ts`. The API startup starts pg-boss and registers the background jobs before accepting HTTP traffic.

A job should encapsulate background processing rather than being mixed into HTTP route handlers. Use the existing queue/job pattern for new background work.

## Socket.IO

Realtime server code lives under:

```text
src/socket/
```

Keep socket authentication/connection/event emission separate from HTTP controllers.

**Current runtime note:** `initSocket(server)` is currently commented out in `src/index.ts`. Socket modules and shared event types exist, but do not assume the Socket.IO server is currently initialized at runtime. Verify before relying on realtime behavior or adding socket-dependent functionality.

## Response contracts

Client-facing response types are defined in `@repo/schemas/types`.

When changing an API response:

1. update the shared type;
2. update API implementation;
3. inspect query consumers;
4. update UI consumers;
5. run typecheck.

## DB/API safety

Never trust a client-provided user ID for authorization when the authenticated user identity is available from the server session.

Resource ownership should be enforced by the existing middleware/pattern.

## API package scripts

The supplied API package exposes:

- `dev`
- `build`
- `start`
- `db`
- `db:old`
- `db:prod`
- `db:push`
- `db:generate`
- `db:migrate`
- `db:migrate:prod`
- `format`
- `format:check`

Prefer the existing scripts over inventing commands. Confirm package scripts in the current checkout before running them.

## API changes checklist

```text
[ ] Shared request schema checked
[ ] Shared response type checked
[ ] Router updated
[ ] Middleware/ownership check present
[ ] Controller updated
[ ] DB constraints respected
[ ] Mobile consumers checked
[ ] Other app consumers checked
[ ] Query/mutation invalidation checked
[ ] Typecheck/lint run
```
