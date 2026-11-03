# GameShelf Database Contract

## Technology

- PostgreSQL
- Drizzle ORM
- Native PostgreSQL `uuid` primary keys and UUID foreign keys
- UUIDv7 generation in application code via the `uuid` package (`v7`)

Current Drizzle schemas use `uuid(...)` columns and `$defaultFn(() => uuidv7())` for generated IDs. Do not use the old nanoid/text-ID convention for new records unless the schema is deliberately changed.
- Neon serverless driver in production
- node-postgres in local development

The API combines schema and relation definitions when constructing the Drizzle database object.

## Tables

### user

Primary application user.

Important fields:

- `id`
- `name`
- `email`
- `emailVerified`
- `image`
- `steamId`
- `PSNAccountId`
- `userAccountType`
- `isAdult`
- `createdAt`
- `updatedAt`

`email` is unique.

## Authentication tables

### session

Belongs to a user through `userId`.

Deleting the user cascades to sessions.

### account

Belongs to a user through `userId`.

Stores provider/account identity and token fields.

### verification

Stores verification records.

## collection

Represents a user's game collection entry.

Important fields:

- `id`
- `name`
- `edition`
- `dateOfPurchase`
- `amount`
- `image`
- `customImage`
- `coverImage`
- `customCoverImage`
- `ownershipType`
- `status`
- `platform`
- `provider`
- `PSVersion[]`
- `completions`
- `dlcCount`
- `archived`
- `igdbId`
- `npCommunicationIds`
- `steamAppId`
- `steamGridDBId`
- `userId`
- `createdAt`
- `updatedAt`

Indexes include user, platform, and provider.

### Collection provider/platform constraint

Valid combinations are:

```text
PS   → PSN, Physical
PC   → Steam, Epic
XBOX → XBOX, Physical
```

This is enforced at DB level.

### Collection PS version constraint

PS collections must have at least one PS version.

Non-PS collections must have no PS versions.

### Collection trophy ID constraints

`npCommunicationIds`:

- must be a JSON object
- only allows PS3/PS4/PS5 keys
- keys must correspond to owned PS versions
- must be empty for non-PS collections
- values must match the NPWR-style format enforced by the DB constraint

### Steam uniqueness

A user cannot have the same Steam app/provider combination duplicated according to the `user_steam_game_unique` constraint.

## dlc

Represents DLC belonging to a collection.

Important fields:

- `id`
- `name`
- `dateOfPurchase`
- `amount`
- artwork fields
- `ownershipType`
- `status`
- `completions`
- `archived`
- `igdbId`
- `steamAppId`
- `steamGridDBId`
- `collectionId`
- `userId`
- timestamps

`collectionId` is required.

Deleting the parent collection cascades to its DLCs.

## completion

Represents completion of either a Game or DLC.

Important fields:

- `id`
- `gameType`
- `totalPlaytime`
- `completedAt`
- `notes`
- `completionStyle`
- `platform`
- `PSVersion`
- `collectionId`
- `dlcId`
- `userId`
- timestamps

### Completion target invariant

A completion must represent exactly one target:

```text
gameType = Game
→ collectionId IS NOT NULL
→ dlcId IS NULL

gameType = DLC
→ dlcId IS NOT NULL
→ collectionId IS NULL
```

### Completion PS version invariant

```text
platform = PS
→ PSVersion IS NOT NULL

platform != PS
→ PSVersion IS NULL
```

## playthrough

Represents a playthrough of either a Game or DLC.

Important fields:

- `id`
- `startedAt`
- `finishedAt`
- `status`
- `totalSeconds`
- `gameType`
- `notes`
- `collectionId`
- `dlcId`
- `userId`
- `completionId`
- timestamps

### Playthrough target invariant

Exactly one target is allowed:

```text
gameType = Game
→ collectionId IS NOT NULL
→ dlcId IS NULL

gameType = DLC
→ dlcId IS NOT NULL
→ collectionId IS NULL
```

`completionId` is optional and uses `ON DELETE SET NULL`.

## playthrough_session

Stores individual play sessions.

Fields:

- `id`
- `playDate`
- `secondsPlayed`
- `playthroughId`
- `userId`
- `createdAt`

A play session belongs to a playthrough.

Deleting a playthrough cascades to its sessions.

Indexes support playthrough lookup and play-date lookup.

## list

A user's custom list.

Fields:

- `id`
- `name`
- `userId`
- `createdAt`

## list_item

Join table between a list and collection game.

Fields:

- `id`
- `listId`
- `collectionId`
- `createdAt`

The database enforces:

```text
unique(listId, collectionId)
```

so the same collection entry cannot be added twice to the same list.

## Relations

The relation layer defines:

```text
user
├── sessions
├── accounts
├── verifications
├── collections
├── dlcs
├── playthroughs
├── playthroughSessions
├── completions
└── lists

collection
├── user
├── dlcs
├── playthroughs
├── completions
└── listItems

dlc
├── collection
├── user
├── playthroughs
└── completions

playthrough
├── user
├── collection
├── dlc
└── sessions

playthroughSession
├── playthrough
└── user

completion
├── user
├── collection
└── dlc

list
├── user
└── items

listItem
├── list
└── collection
```

## ID type and generation

The current API schema uses native PostgreSQL UUID columns for primary keys and UUID foreign keys across the user, authentication, collection, DLC, completion, playthrough, playthrough-session, list, and list-item tables.

New IDs are generated in application code with UUIDv7:

```ts
import { v7 as uuidv7 } from "uuid";

id: uuid("id")
  .primaryKey()
  .$defaultFn(() => uuidv7())
```

Important distinctions:

- `account.accountId` remains a text provider/account identifier; it is not the UUID primary key.
- External identifiers such as Steam App IDs, IGDB IDs, PSN IDs, and NP communication IDs remain strings where defined as text/JSON values.
- When changing IDs or relationships, inspect every API/client type and route parameter that carries an ID.

## Migration discipline

The API repository contains ordered Drizzle migrations, including migrations for:

- account issuer
- PlayStation version arrays
- Playthrough completed status
- play-session indexing
- completion/playthrough linking
- completion PS version
- DLC NP communication ID removal
- NP communication ID → IDs
- JSONB conversion
- NP communication ID constraints
- `0012_uuid_ids_migration.sql` — UUID conversion work for primary keys and foreign keys

**Migration caution:** the supplied `0012_uuid_ids_migration.sql` contains a commented-out data-preserving UUID mapping approach followed by active `ALTER COLUMN ... SET DATA TYPE uuid` statements. Do not assume this file safely converts arbitrary existing nanoid/text values. Before running or changing this migration, inspect the actual database state, the full SQL, and Drizzle's migration status; confirm that existing values are already UUID-compatible or that an explicit data-preserving conversion is in place. Never casually edit or rerun a production migration.

Do not rewrite migration history to make a new change appear simpler. Add a new migration following the repository's established process.

## Important DB principle

Database constraints are domain rules, not incidental implementation details. When changing related application validation, keep it compatible with these constraints.
