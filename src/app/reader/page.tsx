"use client";

import { useEffect, useState, useRef, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useArticles } from "@/hooks/useArticles";
import { useFeeds } from "@/hooks/useFeeds";
import { markAsRead } from "@/lib/firestore";
import Sidebar from "@/components/layout/Sidebar";
import ArticleList from "@/components/layout/ArticleList";
import ArticleView from "@/components/layout/ArticleView";

type ActiveColumn = "sidebar" | "list" | "article";

type SidebarItem =
  | { kind: "all" }
  | { kind: "filter"; value: "unread" | "bookmarks" }
  | { kind: "folder"; folderId: string }
  | { kind: "feed"; feedId: string };

function getInitialSidebarIndex(
  items: SidebarItem[],
  feedId: string | null,
  filter: string | null
): number {
  if (feedId) {
    const i = items.findIndex(x => x.kind === "feed" && x.feedId === feedId);
    return i >= 0 ? i : 0;
  }
  if (filter === "unread") {
    return items.findIndex(x => x.kind === "filter" && x.value === "unread");
  }
  if (filter === "bookmarks") {
    return items.findIndex(x => x.kind === "filter" && x.value === "bookmarks");
  }
  return 0;
}

function ReaderContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeColumn, setActiveColumn] = useState<ActiveColumn>("list");
  const [sidebarCursorIndex, setSidebarCursorIndex] = useState(0);
  const [iframeMode, setIframeMode] = useState(false);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const articleViewRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      document.cookie = "session=; path=/; max-age=0";
      router.replace("/login");
    }
  }, [user, loading, router]);

  const feedId = searchParams.get("feedId");
  const filter = searchParams.get("filter");
  const articleId = searchParams.get("articleId");

  useEffect(() => { setIframeMode(false); }, [articleId]);

  const { articles, loading: articlesLoading } = useArticles(user?.uid ?? null, feedId);
  const { feeds, folders } = useFeeds(user?.uid ?? null);

  const filteredArticles = useMemo(
    () =>
      articles.filter((a) => {
        if (filter === "unread") return !a.isRead;
        if (filter === "bookmarks") return a.isBookmarked;
        return true;
      }),
    [articles, filter]
  );

  const sidebarItems = useMemo<SidebarItem[]>(
    () => [
      { kind: "all" },
      { kind: "filter", value: "unread" },
      { kind: "filter", value: "bookmarks" },
      ...folders.flatMap((folder) => [
        { kind: "folder" as const, folderId: folder.id },
        ...feeds
          .filter((f) => f.folderId === folder.id)
          .map((f) => ({ kind: "feed" as const, feedId: f.id })),
      ]),
      ...feeds.filter((f) => !f.folderId).map((f) => ({ kind: "feed" as const, feedId: f.id })),
    ],
    [feeds, folders]
  );

  const sidebarHighlightKey = useMemo<string | null>(() => {
    if (activeColumn !== "sidebar") return null;
    const item = sidebarItems[sidebarCursorIndex];
    if (!item) return null;
    switch (item.kind) {
      case "all":    return "all";
      case "filter": return `filter:${item.value}`;
      case "folder": return `folder:${item.folderId}`;
      case "feed":   return `feed:${item.feedId}`;
    }
  }, [activeColumn, sidebarCursorIndex, sidebarItems]);

  const setCardRef = useCallback((id: string, node: HTMLElement | null) => {
    if (node) cardRefs.current.set(id, node);
    else cardRefs.current.delete(id);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (activeColumn === "article" && iframeMode) {
          setIframeMode(false);
        } else {
          setActiveColumn((c) => {
            if (c === "article") return "list";
            if (c === "list") {
              setSidebarCursorIndex(getInitialSidebarIndex(sidebarItems, feedId, filter));
              return "sidebar";
            }
            return "sidebar";
          });
        }
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (activeColumn === "article" && articleId && !iframeMode) {
          setIframeMode(true);
        } else if (activeColumn !== "article") {
          setActiveColumn((c) =>
            c === "sidebar" ? "list" : "article"
          );
        }
        return;
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();

        if (activeColumn === "sidebar") {
          if (sidebarItems.length === 0) return;
          const nextIndex =
            e.key === "ArrowDown"
              ? Math.min(sidebarCursorIndex + 1, sidebarItems.length - 1)
              : Math.max(sidebarCursorIndex - 1, 0);
          setSidebarCursorIndex(nextIndex);

          const next = sidebarItems[nextIndex];
          const params = new URLSearchParams();
          if (articleId) params.set("articleId", articleId);

          switch (next.kind) {
            case "all":
              router.push(`/reader${articleId ? `?articleId=${articleId}` : ""}`);
              break;
            case "filter":
              params.set("filter", next.value);
              router.push(`/reader?${params.toString()}`);
              break;
            case "folder":
              break;
            case "feed":
              params.set("feedId", next.feedId);
              router.push(`/reader?${params.toString()}`);
              break;
          }
          return;
        }

        if (activeColumn === "article" && articleViewRef.current) {
          articleViewRef.current.scrollBy({
            top: e.key === "ArrowDown" ? 120 : -120,
            behavior: "smooth",
          });
          return;
        }

        if (activeColumn === "list") {
          if (filteredArticles.length === 0) return;
          const currentIndex = filteredArticles.findIndex((a) => a.id === articleId);
          let nextIndex: number;
          if (currentIndex === -1) {
            nextIndex = 0;
          } else if (e.key === "ArrowDown") {
            nextIndex = Math.min(currentIndex + 1, filteredArticles.length - 1);
          } else {
            nextIndex = Math.max(currentIndex - 1, 0);
          }

          const next = filteredArticles[nextIndex];
          if (next.id === articleId) return;

          const params = new URLSearchParams();
          if (feedId) params.set("feedId", feedId);
          if (filter) params.set("filter", filter);
          params.set("articleId", next.id);
          router.push(`/reader?${params.toString()}`);

          if (!next.isRead && user) markAsRead(user.uid, next.id, true);
          cardRefs.current.get(next.id)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    },
    [
      activeColumn,
      iframeMode,
      sidebarCursorIndex,
      sidebarItems,
      filteredArticles,
      articleId,
      feedId,
      filter,
      router,
      user,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">Ładowanie...</div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        userId={user.uid}
        feeds={feeds}
        folders={folders}
        isActive={activeColumn === "sidebar"}
        onActivate={() => setActiveColumn("sidebar")}
        highlightedKey={sidebarHighlightKey}
      />
      <ArticleList
        userId={user.uid}
        feedId={feedId}
        filter={filter}
        articleId={articleId}
        isActive={activeColumn === "list"}
        onActivate={() => setActiveColumn("list")}
        filteredArticles={filteredArticles}
        loading={articlesLoading}
        setCardRef={setCardRef}
      />
      <ArticleView
        userId={user.uid}
        articleId={articleId}
        isActive={activeColumn === "article"}
        onActivate={() => setActiveColumn("article")}
        viewRef={articleViewRef}
        iframeMode={iframeMode}
        onIframeClose={() => setIframeMode(false)}
      />
    </div>
  );
}

export default function ReaderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">Ładowanie...</div>
      }
    >
      <ReaderContent />
    </Suspense>
  );
}
