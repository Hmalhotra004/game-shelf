# Claude Web Project Instructions

You are working on **GameShelf**, an existing game collection management application.

Treat the uploaded GameShelf context documents as persistent project context.

## Non-negotiable behavior

- Follow existing GameShelf conventions before suggesting or implementing new patterns.
- Do not make me repeat architecture or coding conventions that are documented in the project context.
- Inspect existing code before making non-trivial changes.
- Do not invent APIs, database fields, routes, packages, or business rules.
- Do not rewrite architecture unless explicitly requested.
- Prefer small, focused changes.
- Reuse shared schemas, types, queries, mutations, utilities, and UI components when they already exist.
- When modifying shared packages, inspect their consumers first.
- When modifying database behavior, inspect schema, relations, migrations, shared schemas, API consumers, and client consumers.
- Preserve existing behavior unless the requested task requires changing it.
- Do not assume a web application exists.

## Current repository

```text
apps/
├── api/
└── mobile/

packages/
├── schemas/
└── utils/
```

A future `apps/web` application is planned, but it does not currently exist. Do not create or modify it unless explicitly asked.

## Architecture

The API owns server-side business logic, persistence, authentication/authorization, external integrations, sockets, and jobs. Current internal DB IDs are UUIDv7 values stored in native PostgreSQL UUID columns. The API uses Redis and pg-boss for infrastructure/background jobs; Socket.IO modules exist, but the server initializer is currently commented out in the supplied startup code.

The mobile app owns Expo Router screens and mobile UI.

`@repo/schemas` owns shared validation contracts, enums, and types.

`@repo/utils` owns reusable client data-access patterns, React Query queries/mutations, filter stores, hooks, and utilities.

## Development approach

Before implementing a feature:

1. Find the relevant existing implementation.
2. Find the closest established pattern.
3. Check shared contracts.
4. Check API/DB dependencies if relevant.
5. Implement consistently.
6. Check affected consumers.
7. Verify with the appropriate tooling.

When there is a conflict between a generic best practice and an established GameShelf pattern, preserve the GameShelf pattern unless the user explicitly asks to change it.

## Important domain

GameShelf distinguishes:

- Game vs DLC.
- Collection vs playthrough vs completion.
- Platform vs provider.
- Archived vs deleted.

Do not flatten these concepts.

Read `docs/domain-rules.md` before changing related behavior.

Before changing mobile release/update behavior, inspect the app variant configuration, package version, native build numbers, update gate, updater utility, shared release type, and API version endpoint together.

Do not assume Wishlist, Stats, DLC management, or microtransactions screens are complete in the supplied snapshot; several are placeholders. The mobile Expo web preview target is not a standalone `apps/web` workspace.

## Response style

For implementation tasks:

- Briefly state the approach when the task is non-trivial.
- Make the change.
- Explain what changed.
- State what was verified.
- Be explicit about anything that could not be verified.

Do not repeatedly explain the entire architecture unless asked.

## Documentation maintenance

When the user makes a durable architectural decision, update the appropriate project documentation.

When current project state changes materially, update `docs/current-state.md`.

Do not store temporary implementation details as permanent architecture decisions.
