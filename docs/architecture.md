# GameShelf Architecture

## Current repository

GameShelf currently contains:

```text
apps/
├── api/
└── mobile/

packages/
├── schemas/
└── utils/
```

There is **no `apps/web` currently**.

A web application is planned for the future. It should be treated as a planned workspace only, not as an existing application.

When web development begins, its conventions must be derived from its actual source rather than invented in advance.

## High-level dependency model

```text
                 GameShelf
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
      apps/api            apps/mobile
          │                   │
          └───────┬───────────┘
                  ↓
        ┌──────────────────┐
        │ Shared Packages  │
        ├──────────────────┤
        │ @repo/schemas    │
        │ @repo/utils      │
        └──────────────────┘
```

The shared packages must remain application-agnostic.

## API

`apps/api` is an Express + TypeScript backend.

Observed structure:

```text
src/
├── controllers/
│   ├── auth/
│   ├── collection/
│   ├── completion/
│   ├── igdb/
│   ├── list/
│   ├── playthroughs/
│   ├── psn/
│   ├── stats/
│   ├── steam/
│   ├── steamGridDB/
│   └── user/
├── db/
├── jobs/
├── lib/
├── middlewares/
├── router/
├── socket/
└── types/
```

### API flow

```text
HTTP request
    ↓
router
    ↓
middleware
    ↓
controller
    ↓
database / lib / external service
    ↓
typed response
```

## Mobile

`apps/mobile` is an Expo React Native application using Expo Router.

Observed structure:

```text
src/
├── app/
├── components/
├── hooks/
├── lib/
├── providers/
├── store/
└── types/
```

Routes are organized using Expo Router route groups.

The root layout provides the application providers including React Query, theme, keyboard, bottom-sheet, safe-area, and routing infrastructure.

## Shared schemas

`packages/schemas` contains:

```text
src/
├── enums/
├── schemas/
└── types/
```

It owns shared validation contracts, enum values, and API/domain types.

## Shared utilities

`packages/utils` contains:

```text
src/
├── constants.ts
├── hooks/
├── lib/
├── mutations/
├── queries/
└── store/
```

Its observed responsibilities are predominantly shared client-side data-access and utility logic.

## Data flow

The mobile app imports shared query options from `@repo/utils` and shared response types/schemas from `@repo/schemas`.

```text
Mobile screen
    ↓
shared React Query query option
    ↓
mobile API client
    ↓
Express API route
    ↓
middleware
    ↓
controller
    ↓
Drizzle
```

Mutation flow similarly uses shared mutation options and query invalidation.

## Architectural constraint

Do not move code between layers just because another architecture would be theoretically cleaner. First identify the established ownership of the feature and preserve it.

Do not introduce `apps/web` as part of unrelated work. It is future scope.
