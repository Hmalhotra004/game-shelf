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

## Jobs

The API has a job layer under `src/jobs`.

A job should encapsulate background processing rather than being mixed into HTTP route handlers.

## Socket.IO

Realtime server code lives under:

```text
src/socket/
```

Keep socket authentication/connection/event emission separate from HTTP controllers.

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
