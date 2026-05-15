# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RSS Reader PWA installable on macOS and mobile. Users add RSS/Atom feeds, read articles in Reader Mode (ad-free via `@mozilla/readability`), sync read status via Firebase Firestore, and use AI features (summarize, translate, auto-tag, sentiment, chat).

## Tech Stack

- **Next.js 15** — App Router, TypeScript strict mode, server components by default
- **Firebase** — Firestore (real-time sync), Firebase Auth (email + password)
- **Tailwind CSS** — all styling
- **PWA** — next-pwa, manifest.json, service worker
- **RSS parsing** — rss-parser (via API route, never direct from frontend due to CORS)
- **Reader Mode** — @mozilla/readability + jsdom (via API route, same reason)

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server
npm run build     # production build
npm run lint      # ESLint check
npm start         # start production server
```

## Architecture

### Key Constraints

- **Firebase client-side only** — always guard with `typeof window !== 'undefined'` before initializing
- **RSS and article fetching must go through Next.js API routes** — browsers block direct RSS/article fetches (CORS)
- **All AI calls go through `/api/ai/route.ts`** — never call AI providers directly from frontend; user API keys must never appear in server logs
- **`useSearchParams()` always requires `<Suspense>`** — Next.js 15 App Router rule. Pattern: export a wrapper component that renders `<Suspense><InnerContent /></Suspense>`, and put `useSearchParams()` inside `InnerContent`. See `src/app/reader/page.tsx` for the established pattern.
- **`'use client'` only when necessary** — hooks, event handlers, browser APIs. Prefer server components.

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

Desktop: 3-column (sidebar | article list | article content)  
Mobile: single-column with bottom navigation

All view state is URL-driven: `?feedId=`, `?filter=unread|bookmarks`, `?articleId=`.  
Child components receive these as props — **do not call `useSearchParams()` in child components**, only in the top-level page component (`ReaderContent` in `reader/page.tsx`).

### Sidebar header buttons

The sidebar header (`src/components/layout/Sidebar.tsx`) has two buttons on the right:
- **↺ (Odśwież)** — refreshes all feeds in parallel; calls `saveArticlesForRefresh()` for each feed. Shows a spinning animation (`animate-spin`) while running, disabled during refresh. Errors on individual feeds are silently ignored.
- **+ (Dodaj)** — opens `AddFeedModal`.

### Settings page navigation

`src/app/settings/page.tsx` has a "← Powrót" link at the top that navigates to `/reader`. It uses Next.js `<Link href="/reader">` with a left-arrow SVG icon.

### Sidebar feed/folder management

Right-click on any feed or folder opens a context menu (`src/components/ui/ContextMenu.tsx`) with:
- **Zmień nazwę** — inline rename: the title text becomes an `<input>`, Enter saves, Escape cancels
- **Usuń** — opens a confirmation dialog (`src/components/ui/ConfirmDialog.tsx`) before deleting

Both components render via `createPortal` to `document.body`. Firestore functions used: `updateFeed`, `deleteFeed`, `updateFolder`, `deleteFolder`. Deleting a folder moves its feeds to unassigned (`folderId: null`) rather than deleting them.

### Article list search

`ArticleList` (`src/components/layout/ArticleList.tsx`) has a magnifying-glass button in its header. Clicking it slides down a search input (CSS `max-h` transition). Filtering is client-side, title-only. State (`searchOpen`, `searchQuery`) is local to `ArticleList` and resets when `feedId` or `filter` prop changes.

### Iframe mode — cookie consent blocking

`/api/proxy/route.ts` injects a `<style>` + `<script>` block into every proxied HTML page. The CSS hides known cookie-consent overlays (OneTrust, CookieBot, CookieConsent, Complianz, Borlabs, etc.) immediately. The script adds a `MutationObserver` to catch popups injected asynchronously, and restores `body { overflow: auto }` which sites often lock when a modal is open.

### State management pattern in `/reader`

`src/app/reader/page.tsx` (`ReaderContent`) owns all shared state and lifts hooks up:
- `useAuth()` — authentication
- `useArticles(userId, feedId)` — article list (lifted from ArticleList)
- `useFeeds(userId)` — feeds + folders (lifted from Sidebar)
- `activeColumn`, `sidebarCursorIndex` — keyboard navigation state

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
- Active column shown with `ring-2 ring-inset ring-blue-500`
- Highlighted sidebar item shown with `bg-blue-100 dark:bg-blue-900`
- `highlightedKey` string format: `"all"`, `"filter:unread"`, `"filter:bookmarks"`, `"folder:{id}"`, `"feed:{id}"`

### AI Integration

`/api/ai/route.ts` accepts `{ action, content, provider, apiKey, model }`.  
Actions: `summarize` | `translate` | `autotag` | `sentiment` | `chat`  
The user's API key comes from their Firestore settings document and is forwarded to the provider — it must never be logged.

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

## Implementation Roadmap

### Stage 1 — Foundation ✅
Auth (register/login/protected routes), add RSS feeds, article list, mark as read (Firestore sync), Reader Mode, PWA manifest + service worker, offline support.

### Stage 2 — Organization ✅
Folders, tags, bookmarks, OPML import/export, filtering (all/unread/bookmarks/folder/tag).

### Stage 3 — AI (BYOK) ✅
AI settings (provider + API key), summarize, translate to Polish, auto-tags, sentiment, chat about article. All features gated on user having saved an API key.

### Stage 4 — Extras (in progress)
- ✅ Keyboard shortcuts: ↑↓ navigate articles, ←→ switch columns, ↑↓ in sidebar navigates filters/feeds
- ✅ Feed/folder management: right-click context menu → rename (inline) / delete (with confirmation)
- ✅ Article list search: magnifying-glass icon slides out a title search field
- ✅ Cookie consent blocking in iframe mode (injected via `/api/proxy`)
- ✅ Manual feed refresh: ↺ button in sidebar header refreshes all feeds, preserves read/bookmark state
- ✅ Settings page back button: "← Powrót" link navigates to `/reader`
- ✅ Unread count badge: decrements when articles are marked as read, increments when new articles arrive via refresh
- ⬜ R — mark as read, B — bookmark, O — open original URL
- ⬜ Keyword alerts
- ⬜ Reading stats/streak
- ⬜ PDF export
