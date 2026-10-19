# GameShelf Context Maintenance

The purpose of this folder is to prevent repeated explanation across Claude conversations.

## What belongs where

### `CLAUDE.md`

Stable instructions Claude should follow while working in the repository.

Keep this authoritative and concise.

### `docs/product.md`

What GameShelf is and what its domain concepts mean.

### `docs/architecture.md`

Where code belongs and how applications/packages interact.

### `docs/database.md`

Database structure and persistence invariants.

### `docs/domain-rules.md`

Explicit business rules that must not be accidentally changed.

### `docs/conventions.md`

Observed coding/style conventions.

### `docs/shared-packages.md`

Responsibilities and usage of shared packages.

### `docs/api.md`

Backend-specific conventions.

### `docs/mobile.md`

Mobile-specific conventions.

### `docs/decisions.md`

Durable architectural decisions.

### `docs/current-state.md`

Temporary/current project state.

### `docs/working-style.md`

How Claude should approach tasks and avoid unnecessary changes.

## Update rules

When a durable convention changes:

1. Update the relevant document.
2. Update `CLAUDE.md` if Claude must always obey it.
3. If it is an architectural decision, record it in `decisions.md`.

When a temporary task finishes:

1. Update `current-state.md`.
2. Do not add the temporary detail to permanent architecture docs.

## Keeping Claude synchronized

After major architecture changes, ask Claude to:

> Review the GameShelf source and update the context documentation to match the current implementation. Do not invent conventions that are not demonstrated by the code.

## Source of truth

When documentation conflicts with actual source code:

- For implementation details, inspect the current source.
- For explicit user decisions, follow the user's latest decision.
- Update stale documentation rather than preserving contradictory instructions.

## Important limitation

Project Knowledge improves cross-chat context, but it does not mean Claude has every line of the repository loaded into every response.

For a specific coding task, Claude should inspect the relevant source files as well as these documents.
