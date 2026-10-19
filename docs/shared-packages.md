# GameShelf Shared Packages

## `@repo/schemas`

Location:

```text
packages/schemas/src/
├── enums/
├── schemas/
└── types/
```

Exports are separated by purpose:

```text
@repo/schemas/enums/*
@repo/schemas/schemas/*
@repo/schemas/types/*
```

There is also a server-schema export path.

### Enums

The package defines value arrays such as:

- `GameTypeValues`
- `PlatformValues`
- `PSVersionValues`
- `ProviderValues`
- `OwnershipTypeValues`
- `CollectionStatusValues`
- `CompletionStatusValues`
- `PlaythroughStatusValues`
- `CompletionStyleValues`
- `SyncTypeValues`
- `SyncTypeStatusValues`
- `UserAccountTypeValues`

These are used to create shared Zod enum schemas and shared types.

### Zod schemas

Domain schemas include:

```text
auth
collection
completion
dlc
list
playthrough
psn
steam
user
```

Collection validation includes provider/platform compatibility, PS version requirements, DLC parent requirements, and external image validation.

### Types

Types include API request/response contracts for:

```text
collection
completion
igdb
list
playthrough
psn
socketEvents
stats
steam
user
```

## `@repo/utils`

Location:

```text
packages/utils/src/
├── constants.ts
├── hooks/
├── lib/
├── mutations/
├── queries/
└── store/
```

### Queries

Feature query modules include:

- collection
- completion
- IGDB
- list
- playthrough
- PSN
- stats
- Steam
- user

### Mutations

Feature mutation modules include:

- auth
- collection
- completion
- playthrough
- PSN
- Steam
- user

### Stores

Feature filter stores include:

- collection
- completion
- playthrough

### Hooks

Known hooks include:

- `useDebounce`
- `useOTPExpire`

### Utilities

Known utilities include:

- account helpers
- chart colors
- game options
- general utilities

## Ownership rule

When code is shared across apps and already fits one of these package responsibilities, prefer extending the shared package rather than copying the implementation into an app.

Before changing an export, inspect its consumers.
