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

## App identity and variants

The current `app.config.ts` derives the app name, URL scheme, Android package, and iOS bundle identifier from `APP_VARIANT`.

- Development variant: `APP_VARIANT=development`, with a distinct app name/scheme/package/bundle ID.
- Production variant: the normal Game Shelf identity.
- Expo config uses the package version from `package.json`.
- The supplied snapshot has package version `0.4.0`, Android `versionCode: 5`, and iOS `buildNumber: "5"`.

Treat these values as a snapshot, not permanent constants. Before changing release/version behavior, inspect `package.json`, `app.config.ts`, EAS configuration, and the updater/version API contract together.

The mobile package has scripts for local Android/iOS runs, Expo web preview, export, local Android EAS production builds, and semantic package version bumps. Use the current `package.json` as the source of truth for exact scripts.

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

## App update flow

The mobile app includes an Android APK self-update flow:

- `src/lib/updater.ts` reads the installed app version using `expo-application`, with Expo config as fallback.
- It validates and compares semantic versions using `compare-versions`.
- It downloads an APK to the cache using `expo-file-system/legacy`.
- It obtains a content URI and launches the Android package installer using `expo-intent-launcher`.
- Shared `ReleaseInfo` data comes from `@repo/schemas/types`.
- `getMobileVersionQueryOptions(api)` reads the API `/mobile/getVersion` endpoint, which returns `LATEST_VERSION` and `MIN_VERSION` from environment variables.
- `getLatestReleaseQueryOptions(...)` retrieves the latest release metadata used for the APK URL, release notes, and release page.
- The update gate enforces minimum-version updates and offers dismissible optional updates.
- In-app APK installation is Android-only; the gate returns `null` on other platforms.
- The gate rechecks version/release information when the app returns to the active state.

When changing updates, inspect `AppUpdateGate`, `src/lib/updater.ts`, the shared `ReleaseInfo` type, and the API mobile-version endpoint/controller together. Do not expose arbitrary file installation behavior beyond the existing trusted release flow.

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

## Current placeholder screens

In the supplied snapshot:

- Wishlist screen displays "Coming Soon".
- Stats screen displays "Coming Soon" (although the API stats route/types exist).
- The `manage-dlcs` route is currently an empty placeholder.
- The `manage-micro` route is currently an empty placeholder.

Treat these as unfinished UI routes, not completed features. Before implementing them, inspect existing domain/API support and avoid assuming a wishlist or microtransactions backend already exists.

## Expo web preview versus a web app

The mobile package includes an Expo `web` script and web bundling configuration. This is only an Expo web target for the mobile app; it does **not** mean a separate `apps/web` workspace exists.

The standalone web application remains future scope.

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
