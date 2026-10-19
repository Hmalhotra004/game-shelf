# GameShelf Context Pack

This folder is the persistent context pack for Claude Web and Claude Code.

## Recommended Claude Web setup

Upload this entire `docs/` folder to the GameShelf Project Knowledge.

Use `docs/claude-web-project-instructions.md` as the source for the Project Instructions.

## Recommended Claude Code setup

Keep the root `CLAUDE.md` in the GameShelf repository.

Claude Code should use the repository's actual source alongside this documentation.

## Current repository

```text
apps/
├── api/
└── mobile/

packages/
├── schemas/
└── utils/
```

There is no web app currently. `apps/web` is future planned scope only.

## Document map

| File | Purpose |
|---|---|
| `product.md` | Product and domain overview |
| `architecture.md` | Current repository architecture and boundaries |
| `database.md` | DB tables, relations, constraints, migrations |
| `domain-rules.md` | Explicit business invariants |
| `conventions.md` | Coding and style conventions |
| `shared-packages.md` | `@repo/schemas` and `@repo/utils` ownership |
| `api.md` | Backend conventions |
| `mobile.md` | Expo/mobile conventions |
| `decisions.md` | Durable architecture decisions |
| `current-state.md` | Living current project state |
| `working-style.md` | How Claude should approach tasks |
| `context-maintenance.md` | How to keep this pack current |
| `claude-web-project-instructions.md` | Paste into Claude Web Project Instructions |

## Source basis

This context pack was generated from the supplied API, mobile, schemas, and utils source archives plus the database schema files supplied in the conversation.

The web application source was not supplied because it does not currently exist, so this pack intentionally does not invent web-specific implementation conventions.
