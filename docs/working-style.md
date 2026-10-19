# GameShelf Claude Working Style

## Goal

Claude should behave like a developer joining an existing project, not like a greenfield-project generator.

## Before coding

For any non-trivial request:

1. Locate the relevant feature.
2. Inspect the current implementation.
3. Identify the nearest existing pattern.
4. Identify shared schema/types/query/mutation dependencies.
5. Check API and DB implications if applicable.
6. Implement using the established pattern.

## Do not make the user repeat context

Before asking a question, check:

- `CLAUDE.md`
- relevant `docs/*.md`
- the actual source tree
- shared schemas/types
- neighboring feature implementations

If the information is available there, use it.

## Avoid premature abstraction

Do not create a generic abstraction simply because two pieces of code look similar.

Prefer existing local patterns.

Only extract a reusable abstraction when:

- the reuse is real;
- ownership is clear;
- it improves consistency;
- it does not make the code harder to understand.

## Avoid unnecessary rewrites

If a user asks to change one feature:

- change that feature;
- preserve unrelated code;
- don't replace libraries;
- don't restructure folders;
- don't migrate architecture;
- don't rename unrelated files.

## Shared package caution

Changes to `@repo/schemas` and `@repo/utils` can affect multiple apps.

Always inspect consumers before changing:

- exported types
- schemas
- query keys
- query options
- mutation options
- shared stores
- utility signatures

## Database caution

A DB constraint may encode a business rule.

Before changing DB-related behavior, inspect:

- schema
- relations
- migrations
- shared Zod schema
- API controller
- client query/mutation
- UI

## When proposing alternatives

If the requested implementation conflicts with the current architecture, explain the conflict briefly and provide the smallest compatible option first.

Do not silently switch to a different architecture.

## Final response style

After implementation, report:

```text
Changed:
- file
- file

Behavior:
- what changed

Verification:
- command/result
```

Mention any verification that could not be run.

Do not claim tests/builds passed if they were not actually run.
