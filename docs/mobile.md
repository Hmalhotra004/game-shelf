# GameShelf Mobile Conventions

## Stack

The supplied mobile application uses:

- Expo SDK 57
- Expo Router
- React Native
- NativeWind 4
- React Query
- Zustand
- React Hook Form
- Zod
- Gorhom Bottom Sheet
- Shopify FlashList
- Expo Image
- Lucide React Native
- Better Auth Expo
- Socket.IO client
- `@repo/schemas`
- `@repo/utils`

## Route structure

Feature route groups are used:

```text
src/app/
├── (auth)/
├── (tabs)/
├── (collection)/
├── (completion)/
├── (playthrough)/
└── (profile)/
```

Dynamic routes use Expo Router parameter folders such as:

```text
(collection)/[collectionId]/
(playthrough)/[playthroughId]/
```

## Root providers

The root layout establishes:

```text
GestureHandlerRootView
└── QueryClientProvider
    └── ThemeProvider
        └── KeyboardProvider
            └── BottomSheetModalProvider
                └── SafeAreaProvider
                    └── Slot
```

Do not duplicate these providers inside individual screens unless there is a demonstrated feature-specific reason.

## Query configuration

The current root QueryClient configuration is:

```text
queries:
  retry: 3
  retryDelay: exponential, max 30s
  staleTime: 10m
  gcTime: 15m
  refetchOnWindowFocus: false
  refetchOnReconnect: true
  networkMode: offlineFirst

mutations:
  retry: 0
  networkMode: offlineFirst
```

Treat this as a deliberate app-level behavior.

## Screen composition

A typical feature screen composes:

```text
screen
├── Header
├── ScreenWrapper
├── feature filters
├── query
└── list/content
```

The collection screen uses:

- `CollectionFilters`
- `useCollectionFilterStore`
- `useDebounce`
- shared `collectionGetManyQueryOptions`
- `FlashList`
- `CollectionCard2`

## Large lists

Use `FlashList` for large collection-style lists.

Preserve:

- stable `keyExtractor`
- pagination
- pull-to-refresh
- loading state
- error state
- empty state
- pagination footer

## Components

Feature-specific components:

```text
components/collection/
components/completion/
components/playthrough/
components/accounts/
```

Reusable primitives:

```text
components/ui/
```

Do not put a one-off feature component in `components/ui`.

## Bottom sheets

Bottom sheets are a first-class interaction pattern.

Examples include:

- search
- add completion
- start playthrough
- notes
- time
- select values
- multi-select

Reuse `@gorhom/bottom-sheet` patterns already established.

## Forms

Use the reusable controls in:

```text
components/form/
```

These integrate React Hook Form's `Controller` with labels, descriptions, validation messages, and styled inputs/selectors.

## Styling

Use NativeWind.

Prefer semantic tokens:

```text
bg-card
bg-muted
text-foreground
text-muted-foreground
text-primary
text-destructive
border-border
```

Use `cn` for conditional classes.

## Images

The supplied app uses `expo-image`.

For collection cards, the observed pattern is:

```text
customImage ?? image
```

Use the existing image component/pattern rather than adding another image library.

## Theme-aware native values

When a component requires an explicit color value rather than a class, use the theme from `useThemeStore` and `THEME`.

## Navigation

Use Expo Router.

Do not introduce React Navigation screens manually where Expo Router already owns the route.

## Auth gating

The tabs layout checks session state and redirects unauthenticated users to the auth route.

Preserve this routing model.

## Mobile API access

The mobile app uses a central API client from:

```text
src/lib/api.ts
```

Shared queries/mutations receive/use that API client.

Do not create a separate API client for each screen.

## State

Use Zustand for established filter state.

Use React Query for server state.

Do not put server-fetched collections/completions/playthroughs into Zustand just to avoid using React Query.

## UI behavior

Prefer existing:

- skeletons
- loaders
- retry states
- empty states
- confirmation dialogs/sheets
- context menus
- bottom sheets

over creating new equivalents.
