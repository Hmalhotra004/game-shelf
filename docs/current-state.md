# GameShelf Current State

> Living snapshot derived from the updated API, mobile, schemas, and utils archives. Refresh after material code changes.

## Current repository

```text
apps/
├── api/
└── mobile/

packages/
├── schemas/
└── utils/
```

`apps/web` is planned future scope only. It does not currently exist. The mobile package's Expo web preview target is not a separate web application.

## Source analyzed

- Updated API archive
- Updated mobile archive
- Updated `@repo/schemas` archive
- Updated `@repo/utils` archive
- Existing context Markdown files

## Current stack snapshot

### API

- Express 5 + TypeScript
- PostgreSQL + Drizzle ORM
- Better Auth
- Redis
- pg-boss background jobs
- Pino logging
- Socket.IO modules are present, but `initSocket(server)` is commented out in the current API startup file
- UUIDv7 internal IDs

### Mobile

- Expo SDK 57
- Expo Router
- React Native 0.86
- NativeWind 4
- TanStack React Query
- Zustand
- React Hook Form + Zod
- FlashList 2
- Android APK update/download/install flow (minimum version from API env; latest release metadata for optional/forced APK update)

### Shared packages

- `@repo/schemas`: enums, Zod schemas, request/response/domain types, Socket.IO event types, trophy types
- `@repo/utils`: queries, mutations, filter stores, hooks, account/game/trophy helpers

## Current feature areas

### API

- Auth
- Collection and DLC
- Completion
- Lists
- Playthroughs and play sessions
- PSN
- Steam
- SteamGridDB
- IGDB
- Stats
- User/account operations
- Mobile app version information
- Background jobs for PSN NP communication ID and Steam App ID resolution

### Mobile

- Authentication
- Collection
- Collection details/editing and artwork
- DLC-related routes
- Trophies
- Completion
- Playthroughs and time tracking
- Profile and connected accounts
- Lists
- Settings
- App update gate and APK installer flow

### Known unfinished mobile areas in this snapshot

- Wishlist screen is a placeholder ("Coming Soon").
- Stats screen is a placeholder ("Coming Soon"), although stats API/types exist.
- DLC management screen is an empty placeholder.
- Microtransactions management screen is an empty placeholder.
- Do not describe these mobile areas as fully implemented.

## Current ID convention

Internal database primary keys and foreign keys use PostgreSQL UUID columns. New IDs are generated with UUIDv7 through the `uuid` package. This supersedes the old nanoid/text-ID documentation.

## Current database migration snapshot

The API archive includes Drizzle migrations through `0013_np_ids_keys_in_ps_version_constraint_removal.sql`, including `0012_uuid_ids_migration.sql`.

The `0012` file contains a commented-out data-preserving UUID mapping draft followed by active type-alter statements. Inspect the migration and actual database state before applying it; do not assume existing non-UUID text IDs are automatically converted safely.

## Current mobile release snapshot

- Mobile package version: `0.4.0`
- Android `versionCode`: `5`
- iOS `buildNumber`: `5`
- Development and production app identities are selected through `APP_VARIANT`.

These are snapshot values. Check `package.json`, `app.config.ts`, EAS config, and API release/version contract before making release changes.

## Current background processing

pg-boss queue registration is centralized in `src/jobs/index.ts`.

Current jobs resolve PlayStation NP communication IDs and Steam App IDs. Redis and the database are connected during API startup; pg-boss starts and jobs register before the HTTP server begins listening.

## Current data-fetching model

The mobile root QueryClient uses offline-first network mode. Collection data uses infinite pagination. Feature filter state is managed with Zustand and search is debounced.

## Living-project rules

- Keep this file focused on current state, not permanent design philosophy.
- Record durable decisions in `decisions.md`.
- Record stable conventions in `conventions.md`.
- Recheck the source before treating version numbers, scripts, or feature maturity as current.
