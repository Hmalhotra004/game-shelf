# GameShelf — Claude Code Instructions

## 1. Purpose

GameShelf is a game collection management application for managing owned games, DLCs, playthroughs, completions, lists, external gaming accounts, and related game metadata.

This repository is a Turborepo-style monorepo with application and shared-package boundaries.

## 2. Repository boundaries

Current workspaces:

- `apps/mobile` — Expo React Native mobile application.
- `apps/api` — Express/TypeScript backend API.
- `packages/schemas` — shared Zod schemas, enums, and TypeScript API/domain types.
- `packages/utils` — shared React Query queries/mutations, Zustand stores, hooks, and utility functions.

### Future workspace

A web application is planned for the future:

```text
apps/web
```

It does **not currently exist** and must not be assumed to exist.

Do not create, modify, or reference `apps/web` as an existing application unless the user explicitly asks to begin the web application.

## 3. Highest-priority rules

1. **Follow the existing codebase before introducing a new pattern.**
2. **Do not rewrite architecture unless explicitly requested.**
3. **Do not duplicate shared schemas, query keys, API query/mutation logic, or shared domain types when an existing package already owns them.**
4. **Inspect consumers before changing shared packages.**
5. **Treat database constraints and shared Zod schemas as part of the domain contract.**
6. **Preserve existing API response shapes unless the task explicitly requires a breaking change.**
7. **Prefer small, local changes over broad refactors.**
8. **Do not add a dependency when an existing dependency or local utility can solve the problem cleanly.**
9. **Do not silently change business rules while fixing UI or implementation details.**
10. **If an existing pattern is inconsistent, prefer the pattern used by the surrounding feature unless the user asks for cleanup.**
11. **Never invent files, APIs, routes, types, DB columns, or business rules that are not present or requested.**
12. **When uncertain, inspect the relevant files and their consumers before asking the user.**
13. **Do not assume the future web app exists.**

## 4. Change workflow

Before a meaningful change:

1. Identify the affected app/package.
2. Inspect the existing implementation.
3. Find the shared schema/type/query/mutation used by the feature.
4. Inspect related API routes/controllers if the change crosses the client/API boundary.
5. Inspect DB schema/relations if persistence is involved.
6. Reuse the established pattern.
7. Make the smallest coherent change.
8. Check affected consumers.
9. Run the relevant lint/typecheck/build/test command when practical.
10. Summarize changed files and verification.

For a shared-package change, explicitly check all known consumers before changing the public export or type.

## 5. Package ownership

### `packages/schemas`

Owns shared:

- Zod validation schemas.
- Enum value arrays.
- TypeScript types used across applications.
- API request/response contracts.
- Socket event types.

If a request/response/domain contract is shared between API and clients, prefer putting it here.

Do not recreate the same contract independently in mobile or API.

### `packages/utils`

Owns reusable client-side/shared application logic including:

- React Query query options.
- React Query query-key factories.
- React Query mutation options.
- Zustand filter stores.
- Shared hooks.
- Game/domain utility functions.
- Account helpers.
- Shared constants.

The supplied package imports `@repo/schemas` and is consumed by the mobile app.

Do not move API/business logic into this package merely to make a file shorter. Keep ownership aligned with the existing architecture.

### `apps/api`

Owns:

- HTTP routes.
- Controllers.
- Authentication/authorization middleware.
- Database access.
- Backend business logic.
- External service integrations.
- Socket server behavior.
- Jobs.

### `apps/mobile`

Owns:

- Expo Router screens/layouts.
- Mobile UI.
- Native/mobile-specific behavior.
- Composition of shared queries/mutations into screens.
- Mobile state that is not shared.

## 6. Mobile conventions

The supplied mobile app uses:

- Expo.
- Expo Router.
- React Native.
- NativeWind.
- React Query.
- Zustand.
- React Hook Form.
- Zod.
- `@gorhom/bottom-sheet`.
- `@shopify/flash-list`.
- `expo-image`.
- `lucide-react-native`.
- `@repo/schemas`.
- `@repo/utils`.

Prefer existing UI primitives in `src/components/ui`.

Use the existing path alias:

```text
@/*
```

Use `@repo/schemas/...` and `@repo/utils/...` for shared packages.

Screens live under `src/app`, generally grouped by feature using Expo Router route groups such as:

- `(auth)`
- `(tabs)`
- `(collection)`
- `(completion)`
- `(playthrough)`
- `(profile)`

Feature components live under `src/components/<feature>`.

Reusable form controls live under `src/components/form`.

Reusable primitives live under `src/components/ui`.

Use existing `ScreenWrapper`, `Header`, `Loader`, Skeletons, bottom sheets, and UI primitives before creating alternatives.

## 7. React Query conventions

The root mobile layout creates a single `QueryClient` with:

- query retry: 3
- exponential retry delay capped at 30 seconds
- stale time: 10 minutes
- GC time: 15 minutes
- `refetchOnWindowFocus: false`
- `refetchOnReconnect: true`
- `networkMode: "offlineFirst"`
- mutations use `retry: 0`
- mutations also use `networkMode: "offlineFirst"`

Shared query options are defined in `packages/utils/src/queries`.

Shared query-key factories are defined beside their query options.

When adding a query:

1. Prefer a query-key factory.
2. Prefer a shared query-options function in `@repo/utils`.
3. Type the API response using `@repo/schemas`.
4. Keep screen-specific presentation logic in the screen/component.

When adding a mutation:

1. Prefer a shared mutation-options function in `@repo/utils`.
2. Accept the API instance and QueryClient when that matches existing patterns.
3. Invalidate or update all affected query families.
4. Use optimistic updates only where the existing feature pattern warrants it.
5. Roll back optimistic changes on error.

## 8. API conventions

The API is an Express application.

The API is organized around:

- `src/router`
- `src/controllers`
- `src/middlewares`
- `src/lib`
- `src/db`
- `src/socket`
- `src/jobs`

Routes compose middleware and controller handlers.

Feature routers are separated by domain, including collection, completion, list, playthrough, PSN, Steam, SteamGridDB, IGDB, stats, auth, and user.

Authentication and ownership checks are middleware concerns where an existing feature uses them.

Validation is applied through the validation middleware and shared schemas.

Do not put client UI concerns into controllers.

## 9. Database rules

The database uses PostgreSQL with Drizzle ORM.

The schema uses `nanoid()` for application-generated text IDs.

Database schema changes must respect existing migrations and DB constraints.

Do not treat application-level validation as a replacement for an existing DB constraint.

The production DB uses Drizzle's Neon serverless driver; local development uses the node-postgres driver.

## 10. Domain rules that must be preserved

- Platform values are `PC`, `XBOX`, and `PS`.
- Providers are `PSN`, `XBOX`, `Physical`, `Steam`, and `Epic`.
- Provider/platform combinations are constrained.
- PS versions are `PS5`, `PS4`, `PS3`, `PS2`, `PS1`.
- PS version data is only valid for PS collections/completions.
- A collection can have DLCs.
- A completion represents either a Game or DLC, not both.
- A playthrough represents either a Game or DLC, not both.
- A list contains collection items and prevents duplicate collection entries within the same list.
- Deleting a user cascades to owned records.
- Deleting a collection cascades to its DLCs, playthroughs, completions, and list items through the defined relationships.
- A playthrough may reference a completion; deleting that completion sets the playthrough's completion reference to null.

Consult `docs/database.md` for the detailed contract.

## 11. Naming/style

Follow the surrounding code.

Observed conventions include:

- PascalCase React component names.
- camelCase variables/functions.
- Feature-oriented component directories.
- Feature-oriented API controller directories.
- `getMany`, `getById`, `add`, `update`, `delete`, and similar controller naming.
- `QueryKeys` objects for React Query key factories.
- `queryOptions` / `infiniteQueryOptions` for shared query definitions.
- `mutationOptions` for shared mutation definitions.
- TypeScript strict mode.
- Prettier formatting.
- NativeWind class names for mobile styling.
- `cn(...)` for conditional class composition.

Do not rename existing public exports or files merely for stylistic preference.

## 12. UI rules

Prefer existing components and visual language.

The mobile UI uses a dark/light theme system and shared semantic theme tokens such as:

- `background`
- `foreground`
- `card`
- `muted`
- `mutedForeground`
- `primary`
- `destructive`
- `success`
- `warning`
- `border`
- `input`
- `ring`

Prefer semantic NativeWind classes such as `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, and `text-destructive` instead of hardcoding colors.

Use `THEME` when a native component requires an explicit color value.

Avoid introducing arbitrary visual systems when the existing UI primitives already support the requirement.

## 13. Forms

The mobile app uses React Hook Form and Zod.

Use existing form controls from `src/components/form` where appropriate.

The shared schemas package is the source for shared validation contracts.

Do not duplicate complex validation rules in screen components.

## 14. Lists/performance

The collection screen uses `FlashList` and infinite React Query pagination.

For large collections, preserve virtualization/pagination patterns.

Do not replace `FlashList` with a basic `ScrollView` for large datasets without a clear reason.

Use stable keys and memoized callbacks where they are already part of the surrounding pattern.

## 15. External services

Known integrations include:

- IGDB.
- PSN.
- Steam.
- SteamGridDB.

External-service-specific behavior belongs in API/lib/controller layers unless an existing architecture explicitly requires otherwise.

Do not expose server secrets to mobile/web clients.

## 16. Verification

For TypeScript changes, prefer running the relevant:

- lint
- typecheck
- build
- feature tests, if available

For shared package changes, verify downstream consumers.

For DB changes, verify:

- schema
- relations
- migration
- affected controllers
- shared schemas/types
- client queries/mutations
- UI consumers

## 17. Definition of done

A task is not complete merely because the edited file compiles.

Consider the task complete when:

- The requested behavior is implemented.
- Existing conventions are followed.
- Shared contracts are updated when necessary.
- All affected consumers are considered.
- No unnecessary duplicate logic was introduced.
- Relevant validation/types are correct.
- Relevant verification has been run or its limitation is stated.
- The final response clearly states what changed and what was verified.
