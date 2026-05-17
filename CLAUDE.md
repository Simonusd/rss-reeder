# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RSS Reader PWA installable on macOS and mobile. Users add RSS/Atom feeds, read articles in Reader Mode (ad-free via `@mozilla/readability`), sync read status via Firebase Firestore, and use AI features (summarize, translate, auto-tag, sentiment, chat).

## Design Reference

`UI_REDESIGN.md` — kompletna specyfikacja Apple HIG dla tego projektu: kolory, typografia, spacing, radius, cienie, animacje, ASCII layouty i szczegóły każdego komponentu. **Czytaj przed każdą modyfikacją UI** — to autorytatywne źródło projektu wizualnego.

## Tech Stack

- **Next.js 15** — App Router, TypeScript strict mode, server components by default
- **Firebase** — Firestore (real-time sync), Firebase Auth (email + password)
- **Tailwind CSS** — utility classes for layout; design tokens via CSS variables in `globals.css`
- **lucide-react** — all icons (Rss, RefreshCw, Bookmark, Sparkles, etc.)
- **PWA** — next-pwa, manifest.json, service worker
- **RSS parsing** — rss-parser (via API route, never direct from frontend due to CORS)
- **Reader Mode** — @mozilla/readability + jsdom (via API route, same reason)

TypeScript path alias: `@/` → `src/` (configured in `tsconfig.json`). All shared types (`Feed`, `Folder`, `Article`, `UserSettings`, `AIRequest`, etc.) are in `src/types/index.ts`.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server
npm run build     # production build
npm run lint      # ESLint check
npm start         # start production server
node scripts/generate-icons.mjs  # regenerate PWA icons in public/icons/
```

> **Jeśli devserver zgłasza `ENOENT: .next/server/pages/_document.js`** — usuń cache i zrestartuj:
> ```bash
> rm -rf .next && npm run dev
> ```
> Przyczyna: dwie równoczesne instancje `next dev` niszczą cache buildu.

## Styling System

### CSS Variables (globals.css)

All colors, spacing, radius, shadows and transitions are defined as CSS variables in `src/app/globals.css`. **Never hardcode hex values — always use variables.**

```css
/* Colors */
--color-bg-primary / --color-bg-secondary / --color-bg-tertiary
--color-label / --color-label-secondary / --color-label-tertiary / --color-label-quaternary
--color-separator / --color-separator-opaque
--color-accent / --color-accent-green / --color-accent-red / --color-accent-orange / --color-accent-purple / --color-accent-teal
--color-material-thick / --color-material-regular / --color-material-thin

/* Spacing (multiples of 4px) */
--space-1 (4px) … --space-16 (64px)

/* Border radius */
--radius-sm (6px) / --radius-md (10px) / --radius-lg (14px) / --radius-xl (20px) / --radius-full (9999px)

/* Shadows */
--shadow-sm / --shadow-md / --shadow-lg

/* Transitions */
--transition-default / --transition-spring / --transition-fast
```

### Theme switching

`AppearanceSettings` applies theme by adding/removing `.dark` or `.sepia` classes to `document.documentElement` via `useEffect`. The CSS variables for each theme are defined in `globals.css` under `.dark {}` and `.sepia {}` selectors (and `@media (prefers-color-scheme: dark)` for OS-level dark mode).

**Do not add `dark:` Tailwind prefixes** — colors are handled entirely through CSS variables. Tailwind's `dark:` class system is wired to `darkMode: "class"` in `tailwind.config.ts` but the variable-based approach covers it already.

### Typography classes

Defined in `globals.css`: `.text-large-title`, `.text-title1`, `.text-title2`, `.text-title3`, `.text-headline`, `.text-body`, `.text-callout`, `.text-subheadline`, `.text-footnote`, `.text-caption`. Use these instead of arbitrary Tailwind text sizes.

### UI component classes

- `.toolbar` — sticky frosted-glass header (height 52px, backdrop-filter blur)
- `.btn-primary` / `.btn-secondary` / `.btn-ghost` / `.btn-destructive` — button variants
- `.input` — styled form input (height 44px, focus ring)
- `.badge` — unread count pill (blue, 20px)
- `.tag` — teal chip for article tags
- `.modal` / `.modal-overlay` / `.modal-enter` — modal with spring animation
- `.skeleton` — shimmer loading placeholder
- `.reader-content` / `.reader-title` / `.reader-meta` — Reader Mode article layout

### Icons

Use **only** `lucide-react` icons. Size convention: 14px (sidebar items), 16px (toolbar buttons), 20px (large actions). Color is always `currentColor`. Never use emoji as UI icons (only in empty states).

**iOS icon style rule:** Always prefer the iOS-style variant of an icon. Key substitutions: `Share` (not `Share2`), `MessageCircle` (not `MessageSquare`).

Icon mapping:
```
Feedy/RSS:     Rss
Folder:        Folder
Zakładki:      BookmarkIcon / BookmarkCheck
Ustawienia:    Settings
Szukaj:        Search
Nowy feed:     Plus
Odśwież:       RefreshCw
AI/Streść:     Sparkles
Tłumaczenie:   Languages
Chat AI:       MessageCircle
Oryginał:      ExternalLink
Wróć:          ChevronLeft
Chevron:       ChevronRight
Zamknij:       X
Tagi:          Tag
Przeczytane:   CheckCircle2
Nieprzeczytane: (filled circle span)
Artykuły:      Newspaper
Eye toggle:    Eye / EyeOff
Udostępnij:    Share
Pobierz treść: BookOpen
```

## Architecture

### `src/lib/` modules

| File | Purpose |
|------|---------|
| `firebase.ts` | Exports lazy factory functions `db()` and `auth()` — they call `initializeApp` on first use via `getApps()` check, avoiding Next.js SSR double-init. Always call `db()` / `auth()` as functions, not as top-level constants. |
| `firestore.ts` | All Firestore CRUD: subscribe/add/update/delete for feeds, folders, articles, settings, keywords; `saveArticlesForRefresh`, `markAsRead`. |
| `rss.ts` | Wraps `rss-parser`; called from `/api/fetch-feed`. |
| `readability.ts` | Wraps `@mozilla/readability` + `jsdom`; called from `/api/fetch-article`. |
| `ai.ts` | Routes AI requests to Claude / OpenAI / Gemini based on `provider` field; called from `/api/ai`. |
| `auth.ts` | Firebase Auth helpers (`loginUser`, `registerUser`, `logoutUser`). |
| `validate-url.ts` | SSRF guard — `isSafeUrl(url)` returns `false` for non-http(s) schemes, `localhost`, RFC-1918 IPv4, link-local, loopback, and IPv6 private/mapped ranges (`::ffff:`, `fc:`, `fd:`, `fe80:`, `::1`). Called by all three fetch API routes before any outbound request. |

### Hooks (`src/hooks/`)

| Hook | Subscriptions | Returns |
|------|--------------|---------|
| `useAuth()` | Firebase Auth state | `{ user, loading }` |
| `useFeeds(userId)` | Firestore feeds + folders | `{ feeds, folders, loading }` |
| `useArticles(userId, feedId?)` | Firestore articles, client-sorts by `publishedAt` desc | `{ articles, loading }` |
| `useSettings(userId)` | Firestore settings doc | `{ settings, loading }` |

### Key Constraints

- **Firebase lazy init** — `db()` and `auth()` are factory functions (see `src/lib/firebase.ts`); they handle SSR safely via `getApps()`. Always call them as functions, never import a singleton.
- **RSS and article fetching must go through Next.js API routes** — browsers block direct RSS/article fetches (CORS)
- **All AI calls go through `/api/ai/route.ts`** — never call AI providers directly from frontend; user API keys must never appear in server logs
- **`useSearchParams()` always requires `<Suspense>`** — Next.js 15 App Router rule. Pattern: export a wrapper component that renders `<Suspense><InnerContent /></Suspense>`, and put `useSearchParams()` inside `InnerContent`. See `src/app/reader/page.tsx` for the established pattern.
- **`'use client'` only when necessary** — hooks, event handlers, browser APIs. Prefer server components.

### Security

#### SSRF Protection (`src/lib/validate-url.ts`)

All three fetch API routes (`/api/fetch-feed`, `/api/fetch-article`, `/api/proxy`) call `isSafeUrl(url)` before any outbound request. **Always call it when adding a new API route that fetches a user-supplied URL.**

Blocked ranges: non-http(s) schemes, `localhost`, `127.x`, `10.x`, `172.16-31.x`, `192.168.x`, `169.254.x`, IPv6 loopback/private (`::1`, `::ffff:*`, `fc*`, `fd*`, `fe80*`).

**Redirect safety — `safeFetch()`:** Never use raw `fetch()` in server-side code that fetches user-supplied URLs. Use `safeFetch(url, options)` from `src/lib/validate-url.ts` instead — it follows redirects manually (up to 5 hops), re-validating each `Location` header through `isSafeUrl()` before proceeding. Raw `fetch()` defaults to `redirect: "follow"` which bypasses the SSRF guard on 302 responses.

#### `/api/ai` Input Validation

`action` and `provider` are validated against strict allowlists; `content` is capped at 50 000 characters. The `model` field is **not yet validated** — do not interpolate it into URLs without first adding a format check (e.g. `/^[\w.-]{1,100}$/`), because `callGemini` in `src/lib/ai.ts` puts `model` directly in the Gemini API URL path.

#### Gemini API Key

Moved from URL query string (`?key=`) to the `x-goog-api-key` request header in `src/lib/ai.ts`. Do not revert to the query-string form — it would appear in server logs and CDN caches.

#### Error Responses

API routes return generic error messages (`"Nie udało się pobrać artykułu"`, etc.) with no `err.message` forwarding. Keep it this way — internal error details must not leak to the client.

### Data Flow

```
Frontend → /api/fetch-feed → rss-parser → Firestore (articles stored per user)
Frontend → /api/fetch-article → @mozilla/readability → cleaned HTML
Frontend → /api/ai → Claude/OpenAI/Gemini API (using user's BYOK key from Firestore)
```

### Firestore Structure

All data lives under `users/{userId}/` — Firestore rules enforce that users only access their own data.

```
users/{userId}/
  settings          # theme, fontSize, fontFamily, AI provider/model/key, refreshInterval
  feeds/{feedId}    # url, title, folderId, lastFetched, unreadCount, favicon
  folders/{folderId} # name, order
  articles/{articleId} # feedId, title, url, content, summary, publishedAt, isRead, isBookmarked, tags, readingTime, sentiment
  keywords/{keywordId} # word, active
```

Article document ID = `btoa(article.url)` — set in `saveArticles()` and `saveArticlesForRefresh()` in `src/lib/firestore.ts`.

**Article query design** — `subscribeToArticles` in `src/lib/firestore.ts` uses `where("feedId", "==", feedId)` **without** `orderBy` when filtering by feed, to avoid the Firestore composite index requirement (`where` on one field + `orderBy` on a different field always requires a composite index). Sorting by `publishedAt` is done client-side in `useArticles` hook. The "all articles" query (no `where`) still uses Firestore-side `orderBy("publishedAt", "desc")`. **Do not add `orderBy` back to the feedId query** without first creating the composite index in Firebase Console.

**`unreadCount` on feed documents** — maintained by two functions in `src/lib/firestore.ts`:
- `markAsRead(userId, articleId, isRead, feedId)` — requires `feedId` as 4th param; after updating the article, does `getDoc` on the feed then `updateDoc` with `Math.max(0, curr ± 1)`. **Never use Firebase `increment()` FieldValue here** — it had silent runtime failures with Firebase v11; always use the explicit getDoc→compute→updateDoc pattern.
- `saveArticlesForRefresh(userId, feedId, articles)` — called during manual feed refresh. Queries existing article IDs first, then: existing articles get content-only `updateDoc` (preserving `isRead`, `isBookmarked`, `summary`, `tags`, `sentiment`); new articles get `setDoc` with `isRead: false`. Updates `unreadCount` by adding only the count of newly created articles. **Do not use `saveArticles()` for refresh** — it uses blind `merge: true` which overwrites `isRead` on existing articles.

### Layout

Desktop: 3-column (sidebar 260px | article list 380px | article content flex:1)
Mobile: single-column with bottom navigation

All view state is URL-driven: `?feedId=`, `?filter=unread|bookmarks|read`, `?articleId=`.
Child components receive these as props — **do not call `useSearchParams()` in child components**, only in the top-level page component (`ReaderContent` in `reader/page.tsx`).

### Sidebar

`src/components/layout/Sidebar.tsx` — Apple HIG sidebar with:
- Toolbar (frosted glass, `.toolbar` class)
- `RefreshCw` button — refreshes all feeds in parallel via `saveArticlesForRefresh()`, then calls `onRefreshComplete()` callback
- `Plus` button — opens `AddFeedModal`
- Nav links: Wszystkie / Nieprzeczytane / Zakładki / Przeczytane
- Folders (`FolderItem`) and unassigned feeds (`FeedItem`) with unread badges
- Empty state with CTA when no feeds added
- Settings link + logout in footer

**Refresh → navigate to unread:** `onRefreshComplete` is a callback prop defined in `reader/page.tsx`. After refresh completes, if the current URL has no filter (i.e. "all articles" or per-feed view), it navigates to `?filter=unread` (preserving `feedId` if present). Uses `feedIdRef` / `filterRef` to always read the latest URL values regardless of closure age.

### `/article/[id]/` route

`src/app/article/[id]/page.tsx` — standalone article view (mobile PWA share target / direct link). Fetches the article document once from Firestore (no real-time subscription). Renders `AIToolbar` (`src/components/ai/AIToolbar.tsx`) + `ReaderMode`. The route is protected by middleware.

### Settings page navigation

`src/app/settings/page.tsx` has a `ChevronLeft` + "Wstecz" link that navigates to `/reader`.

### Sidebar feed/folder management

Right-click on any feed or folder opens a context menu (`src/components/ui/ContextMenu.tsx`) with:
- **Zmień nazwę** — inline rename: the title text becomes an `<input>`, Enter saves, Escape cancels
- **Usuń** — opens a confirmation dialog (`src/components/ui/ConfirmDialog.tsx`) before deleting

Both components render via `createPortal` to `document.body`. Firestore functions used: `updateFeed`, `deleteFeed`, `updateFolder`, `deleteFolder`. Deleting a folder moves its feeds to unassigned (`folderId: null`) rather than deleting them.

### Article list search

`ArticleList` (`src/components/layout/ArticleList.tsx`) has a `Search` (Lucide) button in its toolbar. Clicking slides down a search input (`max-height` CSS transition). Filtering is client-side, title-only. State (`searchOpen`, `searchQuery`) is local and resets when `feedId` or `filter` prop changes.

Empty states: each filter has a dedicated empty state with icon + title + description. Loading state uses 6 skeleton cards (`.skeleton` shimmer) instead of a spinner.

### Article card

`src/components/articles/ArticleCard.tsx`:
- 3px left blue border when selected
- Title bold (`font-weight: 600`) when unread, gray (`--color-label-secondary`) when read
- `BookmarkIcon` / `BookmarkCheck` appears on hover (opacity transition)
- Relative time with minute precision (e.g. "4 min temu", "2 godz. temu", "wczoraj")
- **Does NOT call `markAsRead` on click** — only navigates to the article. Marking as read is handled by a 3-second timer in `ReaderContent`.

### Iframe mode — cookie consent blocking

`/api/proxy/route.ts` injects a `<style>` + `<script>` block into every proxied HTML page. The CSS hides known cookie-consent overlays immediately. The script adds a `MutationObserver` to catch popups injected asynchronously, and restores `body { overflow: auto }`.

### State management pattern in `/reader`

`src/app/reader/page.tsx` (`ReaderContent`) owns all shared state and lifts hooks up:
- `useAuth()` — authentication
- `useArticles(userId, feedId)` — article list (lifted from ArticleList)
- `useFeeds(userId)` — feeds + folders (lifted from Sidebar)
- `activeColumn`, `sidebarCursorIndex` — keyboard navigation state
- `feedIdRef`, `filterRef` — refs updated synchronously each render, used by `handleRefreshComplete` callback to always read the latest URL params
- `locallyReadIds` — Set of article IDs marked as read in the current session; keeps them visible in `?filter=unread` until refresh. Reset when filter changes or refresh completes.

**Marking as read — 3-second timer:** When `articleId` changes, a `setTimeout(3000)` fires and calls `markAsRead` if the article is still unread. Uses `articlesRef` (ref updated on every articles change) to read the latest article state at fire time. This replaces the old instant-on-click approach. The `locallyReadIds` set ensures the article stays visible in the unread filter even after `isRead` flips to `true` in Firestore.

Props flow down to `Sidebar`, `ArticleList`, `ArticleView`.

**ReaderMode content state** — `src/components/articles/ReaderMode.tsx` keeps a local `content` state. **Never initialize it as `useState(article.content)` and rely on prop changes to update it** — `useState` only runs once on mount. Instead, always reset `content` via `useEffect` keyed on `article.id`, then conditionally fetch from the API if Firestore has no content. See current implementation for the correct pattern.

### Auth & Session

- Firebase Auth handles actual authentication
- A `session=1` cookie is set/cleared manually (used by middleware for SSR route protection)
- When Firebase reports no user, the cookie is cleared before redirecting to `/login` — prevents redirect loops
- Middleware: `src/middleware.ts` — protects `/reader`, `/settings`, `/article`

### Keyboard Navigation

Implemented in `ReaderContent` via a `window` `keydown` listener (`handleKeyDown`):

| Key | Column | Action |
|-----|--------|--------|
| `←` | any | Move focus to previous column |
| `→` | any | Move focus to next column |
| `↑` / `↓` | sidebar | Navigate sidebar items (All / Unread / Bookmarks / Folder / Feed), live URL update |
| `↑` / `↓` | article list | Navigate between articles, auto-open in column 3 |
| `↑` / `↓` | article view | Scroll content by 120px |

- Ignored when focus is in `input` or `textarea`
- Active column has **no visible border** — `activeColumn` state exists only for keyboard logic, never rendered as a ring/outline
- Highlighted sidebar item shown with `rgba(0, 122, 255, 0.08)` background
- `highlightedKey` string format: `"all"`, `"filter:unread"`, `"filter:bookmarks"`, `"folder:{id}"`, `"feed:{id}"`

### AI Integration

`/api/ai/route.ts` accepts `{ action, content, provider, apiKey, model }`.
Actions: `summarize` | `translate` | `autotag` | `sentiment` | `chat`
The user's API key comes from their Firestore settings document and is forwarded to the provider — it must never be logged.

Logika AI i pobierania treści jest w dwóch miejscach:

- **`ArticleView`** (`src/components/layout/ArticleView.tsx`) — główny widok 3-kolumnowy
- **`AIToolbar`** (`src/components/ai/AIToolbar.tsx`) — samodzielny komponent używany w `/article/[id]/`; przyjmuje `{ article, userId, onContentFetched }`

Oba komponenty mają tę samą logikę: `fetchFullContent()` i `runAI()`. **Nie duplikuj tej logiki w innych miejscach.**

Toolbar zawiera ikony (icon-only, 16px):

```
[BookOpen] [Sparkles] [Languages] [Tag] | [Share] [ExternalLink]
```

- **BookOpen** — zawsze aktywny; wywołuje `fetchFullContent()` → `GET /api/fetch-article?url=...` → `ReaderMode.contentOverride`
- **Sparkles / Languages / Tag** — aktywne tylko gdy `settings.aiApiKey`; wywołują `runAI("summarize"|"translate"|"autotag")`
- Wynik AI pojawia się w panelu pod toolbarem; przycisk X zamyka panel
- `fetchedContent` i `aiResult` resetowane przy każdej zmianie `articleId`

Przepływ danych:
```
fetchFullContent() → /api/fetch-article → onContentFetched(content) → ReaderMode.contentOverride
```

`ReaderMode` przyjmuje `contentOverride?: string | null` — gdy ustawiony, pomija auto-fetch z Firestore.

### Settings components

`src/components/settings/AppearanceSettings.tsx` exports shared primitives used by all settings sections:
- `SettingsSection` — white card with iOS-style grouped layout
- `SettingsRow` — label + right-side content row with separator
- `Toggle` — iOS-style toggle switch (animated, green when on)

## Environment Variables

Stored in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Remaining work

- ⬜ Keyboard shortcuts: R — mark as read, B — bookmark, O — open original URL
- ⬜ Keyword alerts
- ⬜ Reading stats/streak
- ⬜ PDF export
- ⬜ Walidacja pola `model` w `/api/ai` (regex `/^[\w.-]{1,100}$/`) przed interpolacją w URL Gemini
