# GameShelf Architecture Decisions

This file records decisions that should be treated as stable unless the user explicitly changes them.

## Decision 001 — Monorepo

GameShelf is organized as a Turborepo-style monorepo with applications and shared packages.

## Decision 002 — Shared contracts

Shared validation schemas, enum values, and cross-app API/domain types live in `@repo/schemas`.

## Decision 003 — Shared client data access

Reusable React Query queries, mutations, query-key factories, filter stores, hooks, and utilities live in `@repo/utils`.

## Decision 004 — API ownership

The API owns database access, server-side business logic, authentication/authorization enforcement, and external service integrations.

## Decision 005 — Mobile server state

React Query is used for server state.

Zustand is used for established client-side state such as feature filters and theme state.

## Decision 006 — Mobile routing

Expo Router owns mobile navigation and route structure.

## Decision 007 — Mobile UI system

NativeWind plus the existing `components/ui` primitives form the mobile UI system.

## Decision 008 — Large-list rendering

FlashList is used for collection-style large lists.

## Decision 009 — Database

PostgreSQL + Drizzle ORM is the persistence layer.

## Decision 010 — IDs

Application-generated DB IDs use nanoid.

## Decision 011 — Game/DLC modeling

Game and DLC are distinct records, while completions and playthroughs use an explicit Game/DLC discriminator plus mutually exclusive foreign keys.

## Decision 012 — Playtime

Playthroughs track aggregate seconds and also store individual play sessions.

## Decision 013 — Domain validation

Important business invariants are enforced both through shared validation where appropriate and through database constraints where appropriate.

## Decision 014 — External game metadata

IGDB is used for game metadata/search, PSN for PlayStation account/game information, Steam for Steam integration, and SteamGridDB for artwork.

## Decision 015 — Preserve existing architecture

Refactoring architecture is not the default. Changes should fit the existing design unless the user explicitly asks for architectural improvement.

## Recording future decisions

When the user explicitly makes a new architectural decision, add it here.

Do not turn every temporary implementation detail into an architecture decision.
