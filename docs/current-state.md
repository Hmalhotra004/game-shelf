# GameShelf Current State

> Living document. Update this when meaningful project direction changes.

## Current repository

```text
apps/
├── api/
└── mobile/

packages/
├── schemas/
└── utils/
```

## Future

```text
apps/web
```

is planned but does not currently exist.

Do not write web-specific implementation guidance until the web source exists.

## Source analyzed for this context pack

- API
- Mobile
- Schemas
- Utils
- Database schema files

## Current feature areas

### API

- Auth
- Collection
- Completion
- DLC
- Lists
- Playthroughs
- PSN
- Steam
- SteamGridDB
- IGDB
- Stats
- User
- Socket.IO
- Background jobs

### Mobile

- Auth
- Home/tabs
- Collection
- Collection details/editing
- DLC management
- Completion
- Playthrough
- Profile
- Accounts
- Lists
- Wishlist
- Stats
- Settings

### Shared schemas

- Auth
- Collection
- Completion
- DLC
- List
- Playthrough
- PSN
- Steam
- User
- API/domain types
- Socket event types
- Stats types

### Shared utils

- Queries
- Mutations
- Filter stores
- Hooks
- Game utilities
- Account utilities
- Chart utilities

## Current data-fetching model

The mobile root QueryClient uses an offline-first network mode.

Collection data uses infinite pagination.

Collection filters are held in a Zustand store and search is debounced before querying.

## Current migration history

The API includes sequential Drizzle migrations through the NP communication ID constraint work.

The migration history should be considered historical. New DB changes should be represented by new migrations rather than rewriting old migration files.

## Living-project rules

When updating this file:

- Keep it short.
- Record current work and meaningful state, not every conversation.
- Remove completed temporary items when they stop being useful.
- Keep durable architectural decisions in `decisions.md`.
- Keep stable coding rules in `conventions.md`.
