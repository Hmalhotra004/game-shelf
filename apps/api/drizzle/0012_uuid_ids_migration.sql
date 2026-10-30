-- Convert every text nanoid id / foreign key to a native uuid, keeping all data.
-- Each existing row gets a UUIDv7 whose timestamp is its created_at, so ID order
-- matches creation order. Runs inside drizzle's migration transaction: any failure rolls back everything.
-- Takes ACCESS EXCLUSIVE locks and rewrites every table: run it in a maintenance window.

-- 1. helper: UUIDv7 generator (timestamp = ts)
CREATE FUNCTION _uuid_v7(ts timestamptz) RETURNS uuid LANGUAGE sql VOLATILE AS $$
  SELECT encode(
    set_bit(
      set_bit(
        overlay(uuid_send(gen_random_uuid())
                placing substring(int8send(floor(extract(epoch FROM ts) * 1000)::bigint) FROM 3)
                FROM 1 FOR 6),
        52, 1),
      53, 1),
    'hex')::uuid
$$;
--> statement-breakpoint

-- 2. old id -> new id map for every table
CREATE TABLE _uuid_id_map (
  tbl text NOT NULL,
  old_id text NOT NULL,
  new_id uuid NOT NULL,
  PRIMARY KEY (tbl, old_id)
);
--> statement-breakpoint
INSERT INTO _uuid_id_map SELECT 'user', id, _uuid_v7(created_at) FROM "user";
--> statement-breakpoint
INSERT INTO _uuid_id_map SELECT 'session', id, _uuid_v7(created_at) FROM "session";
--> statement-breakpoint
INSERT INTO _uuid_id_map SELECT 'account', id, _uuid_v7(created_at) FROM "account";
--> statement-breakpoint
INSERT INTO _uuid_id_map SELECT 'verification', id, _uuid_v7(created_at) FROM "verification";
--> statement-breakpoint
INSERT INTO _uuid_id_map SELECT 'collection', id, _uuid_v7(created_at) FROM "collection";
--> statement-breakpoint
INSERT INTO _uuid_id_map SELECT 'dlc', id, _uuid_v7(created_at) FROM "dlc";
--> statement-breakpoint
INSERT INTO _uuid_id_map SELECT 'completion', id, _uuid_v7(created_at) FROM "completion";
--> statement-breakpoint
INSERT INTO _uuid_id_map SELECT 'playthrough', id, _uuid_v7(created_at) FROM "playthrough";
--> statement-breakpoint
INSERT INTO _uuid_id_map SELECT 'playthrough_session', id, _uuid_v7(created_at) FROM "playthrough_session";
--> statement-breakpoint
INSERT INTO _uuid_id_map SELECT 'list', id, _uuid_v7(created_at) FROM "list";
--> statement-breakpoint
INSERT INTO _uuid_id_map SELECT 'list_item', id, _uuid_v7(created_at) FROM "list_item";
--> statement-breakpoint
CREATE FUNCTION _uuid_map(t text, o text) RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT new_id FROM _uuid_id_map WHERE tbl = t AND old_id = o
$$;
--> statement-breakpoint

-- 3. Better Auth stores the user id in account.account_id for credential (email/password) accounts
UPDATE "account"
SET account_id = _uuid_map('user', user_id)::text
WHERE provider_id = 'credential' AND account_id = user_id;
--> statement-breakpoint

-- 4. save every foreign key (exact definition, incl. ON DELETE) and drop it
CREATE TABLE _uuid_fk_backup AS
SELECT format('%I', r.relname) AS tbl, c.conname, pg_get_constraintdef(c.oid) AS def
FROM pg_constraint c
JOIN pg_class r ON r.oid = c.conrelid
LEFT JOIN pg_class f ON f.oid = c.confrelid
WHERE c.contype = 'f'
  AND r.relnamespace = 'public'::regnamespace
  AND (r.relname IN ('user','session','account','verification','collection','dlc','completion',
                     'playthrough','playthrough_session','list','list_item')
       OR f.relname IN ('user','session','account','verification','collection','dlc','completion',
                        'playthrough','playthrough_session','list','list_item'));
--> statement-breakpoint
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tbl, conname FROM _uuid_fk_backup LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
  END LOOP;
END $$;
--> statement-breakpoint

-- 5. convert id and FK columns text -> uuid (indexes, unique and check constraints are rebuilt automatically)
ALTER TABLE "user"
  ALTER COLUMN id TYPE uuid USING _uuid_map('user', id);
--> statement-breakpoint
ALTER TABLE "session"
  ALTER COLUMN id TYPE uuid USING _uuid_map('session', id),
  ALTER COLUMN user_id TYPE uuid USING _uuid_map('user', user_id);
--> statement-breakpoint
ALTER TABLE "account"
  ALTER COLUMN id TYPE uuid USING _uuid_map('account', id),
  ALTER COLUMN user_id TYPE uuid USING _uuid_map('user', user_id);
--> statement-breakpoint
ALTER TABLE "verification"
  ALTER COLUMN id TYPE uuid USING _uuid_map('verification', id);
--> statement-breakpoint
ALTER TABLE "collection"
  ALTER COLUMN id TYPE uuid USING _uuid_map('collection', id),
  ALTER COLUMN user_id TYPE uuid USING _uuid_map('user', user_id);
--> statement-breakpoint
ALTER TABLE "dlc"
  ALTER COLUMN id TYPE uuid USING _uuid_map('dlc', id),
  ALTER COLUMN collection_id TYPE uuid USING _uuid_map('collection', collection_id),
  ALTER COLUMN user_id TYPE uuid USING _uuid_map('user', user_id);
--> statement-breakpoint
ALTER TABLE "completion"
  ALTER COLUMN id TYPE uuid USING _uuid_map('completion', id),
  ALTER COLUMN collection_id TYPE uuid USING _uuid_map('collection', collection_id),
  ALTER COLUMN dlc_id TYPE uuid USING _uuid_map('dlc', dlc_id),
  ALTER COLUMN user_id TYPE uuid USING _uuid_map('user', user_id);
--> statement-breakpoint
ALTER TABLE "playthrough"
  ALTER COLUMN id TYPE uuid USING _uuid_map('playthrough', id),
  ALTER COLUMN collection_id TYPE uuid USING _uuid_map('collection', collection_id),
  ALTER COLUMN dlc_id TYPE uuid USING _uuid_map('dlc', dlc_id),
  ALTER COLUMN completion_id TYPE uuid USING _uuid_map('completion', completion_id),
  ALTER COLUMN user_id TYPE uuid USING _uuid_map('user', user_id);
--> statement-breakpoint
ALTER TABLE "playthrough_session"
  ALTER COLUMN id TYPE uuid USING _uuid_map('playthrough_session', id),
  ALTER COLUMN playthrough_id TYPE uuid USING _uuid_map('playthrough', playthrough_id),
  ALTER COLUMN user_id TYPE uuid USING _uuid_map('user', user_id);
--> statement-breakpoint
ALTER TABLE "list"
  ALTER COLUMN id TYPE uuid USING _uuid_map('list', id),
  ALTER COLUMN user_id TYPE uuid USING _uuid_map('user', user_id);
--> statement-breakpoint
ALTER TABLE "list_item"
  ALTER COLUMN id TYPE uuid USING _uuid_map('list_item', id),
  ALTER COLUMN list_id TYPE uuid USING _uuid_map('list', list_id),
  ALTER COLUMN collection_id TYPE uuid USING _uuid_map('collection', collection_id);
--> statement-breakpoint

-- 6. restore every foreign key exactly as it was
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tbl, conname, def FROM _uuid_fk_backup LOOP
    EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s', r.tbl, r.conname, r.def);
  END LOOP;
END $$;
--> statement-breakpoint

-- 7. cleanup
DROP FUNCTION _uuid_map(text, text);
--> statement-breakpoint
DROP FUNCTION _uuid_v7(timestamptz);
--> statement-breakpoint
DROP TABLE _uuid_fk_backup;
--> statement-breakpoint
DROP TABLE _uuid_id_map;







-- ALTER TABLE "collection" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "collection" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "dlc" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "dlc" ALTER COLUMN "collection_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "dlc" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "completion" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "completion" ALTER COLUMN "collection_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "completion" ALTER COLUMN "dlc_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "completion" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "account" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "session" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "verification" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "playthrough" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "playthrough" ALTER COLUMN "collection_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "playthrough" ALTER COLUMN "dlc_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "playthrough" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "playthrough" ALTER COLUMN "completion_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "playthrough_session" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "playthrough_session" ALTER COLUMN "playthrough_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "playthrough_session" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "list" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "list" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "list_item" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "list_item" ALTER COLUMN "list_id" SET DATA TYPE uuid;--> statement-breakpoint
-- ALTER TABLE "list_item" ALTER COLUMN "collection_id" SET DATA TYPE uuid;