# Contributing to GameShelf

Thanks for your interest in contributing! Anyone is welcome to propose changes. All changes go through a pull request and are reviewed and merged by the maintainer ([@Hmalhotra004](https://github.com/Hmalhotra004)).

## Workflow

1. **Fork** the repository and clone your fork.
2. **Create a branch** from `main`, e.g. `fix/collection/filter` or `feat/wishlist/screen`.
3. **Make a focused change.** One concern per PR.
4. **Run checks locally** (see below).
5. **Open a pull request** against `main` and fill in the PR template.
6. A maintainer reviews. Address feedback by pushing more commits to the same branch.

You cannot push to this repository directly, and `main` is protected: every change needs the maintainer's approval before it is merged.

## Repository layout

```text
apps/
├── api/        Express + TypeScript backend (Drizzle, PostgreSQL)
└── mobile/     Expo / React Native app (Expo Router, NativeWind)

packages/
├── schemas/    @repo/schemas: shared Zod schemas, enums, types
└── utils/      @repo/utils: shared React Query queries/mutations, stores, hooks
```

## Getting started

Requirements: Node.js 24+ and [pnpm](https://pnpm.io/).

```bash
pnpm install
```

Copy the example environment files and fill in your own values. Never commit real credentials:

```bash
cp apps/api/.env.example apps/api/.env
```

The API needs PostgreSQL and Redis. External integrations (IGDB, Steam, PSN, SteamGridDB, email) need your own API keys; see `.env.example`.

## Checks before opening a PR

```bash
pnpm --filter ./apps/api run format:check
pnpm --filter ./apps/api run build
pnpm --filter ./apps/mobile exec tsc --noEmit
```

CI runs the same checks on every pull request.

## Guidelines

- **Follow existing patterns.** Look at neighbouring code before adding something new. Don't introduce new libraries, rename unrelated files, or restructure folders as part of a feature or fix.
- **Shared packages** (`@repo/schemas`, `@repo/utils`) are used by multiple apps. If you change an export, check every consumer.
- **Database changes** need a new Drizzle migration. Never edit an existing migration. Database constraints encode business rules (Game vs DLC targets, platform/provider combinations, etc.), so keep application validation compatible with them.
- **Don't flatten the domain.** Game vs DLC, collection vs playthrough vs completion, and archived vs deleted are distinct concepts.
- **Mobile UI:** use NativeWind semantic theme classes and the existing `components/ui` primitives. Include screenshots or a short recording in the PR.
- **Formatting:** use the repository's Prettier configuration; don't reformat unrelated files.
- **Secrets:** never commit `.env` files, tokens, or keys.

## Reporting bugs and suggesting features

Open an issue first for larger changes so the direction can be agreed before you invest time. For bugs, include steps to reproduce, expected vs actual behavior, and platform/version.

## Security

Please don't open public issues for security vulnerabilities. Contact the maintainer privately through GitHub (Security tab → Report a vulnerability).

## License

By contributing, you agree that your contributions are licensed under the project's license.
