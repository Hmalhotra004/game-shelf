# GameShelf Coding Conventions

This document records conventions observed in the supplied source. Where the repository has no demonstrated convention, Claude should inspect neighboring code rather than invent one.

## TypeScript

- Strict TypeScript is enabled.
- Prefer explicit useful types over `any`.
- Preserve existing type inference when it makes code clearer.
- Use existing exported shared types.
- Do not duplicate domain types in an app when the shared package already owns them.

## Imports

Use the existing aliases and workspace package imports.

Mobile examples:

```ts
import Something from "@/components/...";
import { SomeType } from "@repo/schemas/types/...";
import { someQuery } from "@repo/utils/queries/...";
```

API uses:

```ts
import { ... } from "@/...";
```

for local source paths.

## React components

Use PascalCase component names.

Use an explicit `Props` interface/type when a component receives props.

Keep feature components under the feature directory.

Example:

```text
components/
  collection/
    CollectionCard.tsx
    CollectionFilters.tsx
```

## Mobile UI

Use NativeWind classes for styling.

Prefer semantic theme classes:

```text
bg-card
bg-muted
text-foreground
text-muted-foreground
text-primary
text-destructive
border-border
```

Use `cn(...)` for conditional class composition.

Use the existing UI primitives before building a new primitive.

## Icons

The supplied mobile code uses `lucide-react-native`.

Follow the existing icon conventions and theme-aware color handling.

## Theme

The mobile app has light/dark theme tokens in `src/lib/theme.ts`.

The theme contains semantic values for background, foreground, card, popover, primary, secondary, muted, accent, destructive, success, warning, border, input, ring, radius, and chart colors.

Do not hardcode a new color palette when a semantic token already expresses the required meaning.

## Forms

The mobile app uses:

- React Hook Form
- Zod
- shared schema package
- reusable form controls

The shared `src/components/form/form.tsx` provides reusable controls built around React Hook Form's `Controller`.

Use the existing controls for consistent labels, descriptions, validation messages, disabled states, and styling.

## React Query

Shared queries live in `packages/utils/src/queries`.

Query keys are grouped using objects such as:

```ts
CollectionQueryKeys
```

with an `all` root and more specific key builders.

Use `queryOptions` for ordinary queries and `infiniteQueryOptions` for paginated lists.

The collection list uses a default page size of 20 and supports infinite pagination.

## Mutations

Shared mutation options live in `packages/utils/src/mutations`.

Mutations receive the API instance and often the QueryClient.

Existing mutation patterns include:

- `mutationFn`
- `onSuccess`
- `onError`
- `onMutate`
- `onSettled`

Optimistic collection archive/delete operations snapshot matching infinite-query data and restore it on error.

When changing mutation behavior, inspect which query families are invalidated by the existing mutation.

## State

Zustand stores in `packages/utils/src/store` are used for feature filters.

The mobile app also has a local theme store.

Do not introduce another state-management solution for a problem already handled by the existing stack.

## API

The backend uses Express routers and feature controllers.

Controllers are grouped by feature.

Observed naming:

```text
add.ts
getMany.ts
getById.ts
update.ts
delete...
archive...
```

Router files register routes and compose middleware/controller handlers.

## Middleware

Authentication and feature ownership checks are implemented as middleware.

Use the existing middleware for the feature rather than reproducing authorization checks in every controller.

Validation is handled through the shared schema + validation middleware pattern.

## Database

Use Drizzle ORM.

Use schema definitions under the API DB schema directory.

Use relations in the dedicated relation module.

Use migrations for schema changes.

Do not bypass existing constraints.

## External integrations

External API integration code is grouped under backend `lib` and feature controllers.

Known integrations:

- IGDB
- PSN
- Steam
- SteamGridDB

Keep provider-specific implementation out of generic UI components.

## Error/loading UI

The mobile collection screen demonstrates a consistent pattern:

```text
loading → Skeleton
error → explanatory text + retry
success → FlashList
empty → empty-state text
pagination → Loader
```

Preserve this style where appropriate.

## Naming

Observed:

- Components: PascalCase.
- Functions/variables: camelCase.
- Types: PascalCase.
- Query-key objects: PascalCase + `QueryKeys`.
- Feature directories: lower-case.
- Route files follow Expo Router conventions.
- API controllers use feature folders and action-oriented filenames.

Do not perform naming cleanup unless requested.

## Formatting

Prettier is used.

The mobile package includes `prettier-plugin-tailwindcss`.

The API package exposes:

```text
format
format:check
```

Follow the repository's configured formatter instead of manually reformatting unrelated files.
