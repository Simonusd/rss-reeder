"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RefreshCw, Plus, Settings, Newspaper,
  BookmarkIcon, CheckCircle2, Rss,
} from "lucide-react";
import FolderItem from "@/components/feeds/FolderItem";
import FeedItem from "@/components/feeds/FeedItem";
import AddFeedModal from "@/components/feeds/AddFeedModal";
import { logout } from "@/lib/auth";
import { saveArticlesForRefresh } from "@/lib/firestore";
import type { Feed, Folder } from "@/types";

interface Props {
  userId: string;
  feeds: Feed[];
  folders: Folder[];
  onActivate: () => void;
  highlightedKey: string | null;
  onRefreshComplete: () => void;
}

const NAV_ITEM =
  "flex items-center gap-2.5 px-3 rounded-lg h-9 text-sm transition-colors duration-150 w-full";

export default function Sidebar({
  userId, feeds, folders, onActivate, highlightedKey, onRefreshComplete,
}: Props) {
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const totalUnread = feeds.reduce((s, f) => s + (f.unreadCount ?? 0), 0);

  async function handleRefresh(e: React.MouseEvent) {
    e.stopPropagation();
    if (refreshing) return;
    setRefreshing(true);
    try {
      await Promise.all(feeds.map(async (feed) => {
        try {
          const res = await fetch(`/api/fetch-feed?url=${encodeURIComponent(feed.url)}`);
          if (!res.ok) return;
          const data = await res.json();
          await saveArticlesForRefresh(userId, feed.id, data.articles);
        } catch { /* ignoruj błąd pojedynczego feedu */ }
      }));
    } finally {
      setRefreshing(false);
      onRefreshComplete();
    }
  }

  async function handleLogout() {
    await logout();
    document.cookie = "session=; path=/; max-age=0";
    router.replace("/login");
  }

  const unassignedFeeds = feeds.filter((f) => !f.folderId);

  return (
    <aside
      onClick={onActivate}
      className="h-full flex flex-col shrink-0"
      style={{
        width: 260,
        background: "var(--color-bg-secondary)",
        borderRight: "1px solid var(--color-separator)",
      }}
    >
      {/* Toolbar */}
      <div className="toolbar" style={{ justifyContent: "space-between" }}>
        <span className="text-headline" style={{ color: "var(--color-label)" }}>
          RSS Reader
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center rounded-lg transition-colors duration-150"
            style={{
              width: 32, height: 32,
              color: "var(--color-accent)",
            }}
            title="Odśwież feedy"
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,122,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowAddFeed(true); }}
            className="flex items-center justify-center rounded-lg transition-colors duration-150"
            style={{ width: 32, height: 32, color: "var(--color-accent)" }}
            title="Dodaj feed"
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,122,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* Główne filtry */}
        <NavLink
          href="/reader"
          isActive={!highlightedKey && highlightedKey !== null ? false : highlightedKey === "all"}
        >
          <Newspaper size={16} />
          <span className="flex-1">Wszystkie artykuły</span>
        </NavLink>

        <NavLink
          href="/reader?filter=unread"
          isActive={highlightedKey === "filter:unread"}
        >
          <span
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 16, height: 16, background: "var(--color-accent)" }}
          />
          <span className="flex-1">Nieprzeczytane</span>
          {totalUnread > 0 && <span className="badge">{totalUnread}</span>}
        </NavLink>

        <NavLink
          href="/reader?filter=bookmarks"
          isActive={highlightedKey === "filter:bookmarks"}
        >
          <BookmarkIcon size={16} />
          <span className="flex-1">Zakładki</span>
        </NavLink>

        <NavLink
          href="/reader?filter=read"
          isActive={highlightedKey === "filter:read"}
        >
          <CheckCircle2 size={16} />
          <span className="flex-1">Przeczytane</span>
        </NavLink>

        {/* Separator */}
        <div
          className="mx-3 my-2"
          style={{ height: 1, background: "var(--color-separator)" }}
        />

        {/* Foldery */}
        {folders.length > 0 && (
          <>
            <p
              className="text-caption px-3 pb-1 pt-1 uppercase tracking-wide"
              style={{ color: "var(--color-label-tertiary)" }}
            >
              Foldery
            </p>
            {folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                feeds={feeds.filter((f) => f.folderId === folder.id)}
                userId={userId}
                highlightedKey={highlightedKey}
              />
            ))}
          </>
        )}

        {/* Nieprzypisane feedy */}
        {unassignedFeeds.length > 0 && (
          <>
            {folders.length > 0 && (
              <p
                className="text-caption px-3 pb-1 pt-2 uppercase tracking-wide"
                style={{ color: "var(--color-label-tertiary)" }}
              >
                Feedy
              </p>
            )}
            {folders.length === 0 && (
              <p
                className="text-caption px-3 pb-1 pt-1 uppercase tracking-wide"
                style={{ color: "var(--color-label-tertiary)" }}
              >
                Feedy
              </p>
            )}
            {unassignedFeeds.map((feed) => (
              <FeedItem
                key={feed.id}
                feed={feed}
                userId={userId}
                highlighted={highlightedKey === `feed:${feed.id}`}
              />
            ))}
          </>
        )}

        {/* Empty state */}
        {feeds.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Rss
              size={48}
              className="mb-4"
              style={{ color: "var(--color-label-quaternary)" }}
            />
            <p className="text-headline mb-1" style={{ color: "var(--color-label)" }}>
              Brak feedów
            </p>
            <p
              className="text-subheadline mb-5"
              style={{ color: "var(--color-label-secondary)" }}
            >
              Dodaj pierwszy feed RSS żeby zacząć czytać
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); setShowAddFeed(true); }}
              className="btn-primary"
              style={{ height: 44, fontSize: 15 }}
            >
              + Dodaj feed
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div
        className="p-2 flex items-center justify-between"
        style={{ borderTop: "1px solid var(--color-separator)" }}
      >
        <Link
          href="/settings"
          className="flex items-center gap-2 px-3 h-9 rounded-lg text-sm transition-colors duration-150"
          style={{ color: "var(--color-label-secondary)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <Settings size={16} />
          <span>Ustawienia</span>
        </Link>
        <button
          onClick={handleLogout}
          className="px-3 h-9 rounded-lg text-sm transition-colors duration-150"
          style={{ color: "var(--color-accent-red)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,59,48,0.08)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          Wyloguj
        </button>
      </div>

      {showAddFeed && (
        <AddFeedModal userId={userId} onClose={() => setShowAddFeed(false)} />
      )}
    </aside>
  );
}

function NavLink({
  href, isActive, children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={NAV_ITEM}
      style={{
        color: isActive ? "var(--color-accent)" : "var(--color-label)",
        background: isActive ? "rgba(0, 122, 255, 0.08)" : "transparent",
        fontWeight: isActive ? 600 : 400,
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.background = "rgba(0,0,0,0.04)";
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </Link>
  );
}
