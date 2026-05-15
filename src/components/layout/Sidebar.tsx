"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  isActive: boolean;
  onActivate: () => void;
  highlightedKey: string | null;
}

const HL = "bg-blue-100 dark:bg-blue-900";
const BASE_LINK = "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-sm";

export default function Sidebar({ userId, feeds, folders, isActive, onActivate, highlightedKey }: Props) {
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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
        } catch {
          // ignoruj błąd pojedynczego feedu
        }
      }));
    } finally {
      setRefreshing(false);
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
      className={`w-64 h-full border-r flex flex-col bg-gray-50 dark:bg-gray-900 shrink-0 transition-shadow ${
        isActive ? "ring-2 ring-inset ring-blue-500" : ""
      }`}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <span className="font-bold text-lg">RSS Reader</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-500 hover:text-blue-600 disabled:opacity-50"
            title="Odśwież feedy"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowAddFeed(true); }}
            className="text-blue-600 hover:text-blue-800 text-xl font-bold"
            title="Dodaj feed"
          >
            +
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        <Link
          href="/reader"
          className={`${BASE_LINK} ${highlightedKey === "all" ? HL : ""}`}
        >
          Wszystkie artykuły
        </Link>
        <Link
          href="/reader?filter=unread"
          className={`${BASE_LINK} ${highlightedKey === "filter:unread" ? HL : ""}`}
        >
          Nieprzeczytane
        </Link>
        <Link
          href="/reader?filter=bookmarks"
          className={`${BASE_LINK} ${highlightedKey === "filter:bookmarks" ? HL : ""}`}
        >
          Zakładki
        </Link>
        <Link
          href="/reader?filter=read"
          className={`${BASE_LINK} ${highlightedKey === "filter:read" ? HL : ""}`}
        >
          Przeczytane
        </Link>

        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            feeds={feeds.filter((f) => f.folderId === folder.id)}
            userId={userId}
            highlightedKey={highlightedKey}
          />
        ))}

        {unassignedFeeds.map((feed) => (
          <FeedItem
            key={feed.id}
            feed={feed}
            userId={userId}
            highlighted={highlightedKey === `feed:${feed.id}`}
          />
        ))}
      </nav>

      <div className="p-2 border-t flex gap-2">
        <Link
          href="/settings"
          className="flex-1 text-center text-sm px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          Ustawienia
        </Link>
        <button
          onClick={handleLogout}
          className="flex-1 text-center text-sm px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-red-600"
        >
          Wyloguj
        </button>
      </div>

      {showAddFeed && <AddFeedModal userId={userId} onClose={() => setShowAddFeed(false)} />}
    </aside>
  );
}
