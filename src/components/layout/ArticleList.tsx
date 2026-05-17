"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import ArticleCard from "@/components/articles/ArticleCard";
import type { Article } from "@/types";

interface Props {
  userId: string;
  feedId: string | null;
  filter: string | null;
  articleId: string | null;
  onActivate: () => void;
  filteredArticles: Article[];
  loading: boolean;
  setCardRef: (id: string, node: HTMLElement | null) => void;
}

function SkeletonCard() {
  return (
    <div style={{ padding: "16px", borderBottom: "1px solid var(--color-separator)" }}>
      <div className="skeleton" style={{ height: 12, width: "50%", marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 16, width: "90%", marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 16, width: "75%", marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 12, width: "60%" }} />
    </div>
  );
}

function filterTitle(filter: string | null, feedId: string | null): string {
  if (feedId) return "Artykuły";
  if (filter === "unread") return "Nieprzeczytane";
  if (filter === "bookmarks") return "Zakładki";
  if (filter === "read") return "Przeczytane";
  return "Wszystkie";
}

export default function ArticleList({
  userId, feedId, filter, articleId, onActivate,
  filteredArticles, loading, setCardRef,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSearchQuery("");
    setSearchOpen(false);
  }, [feedId, filter]);

  const displayed = useMemo(
    () => searchQuery.trim()
      ? filteredArticles.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : filteredArticles,
    [filteredArticles, searchQuery]
  );

  const isEmpty = !loading && displayed.length === 0;

  return (
    <div
      onClick={onActivate}
      className="h-full flex flex-col shrink-0"
      style={{
        width: 380,
        background: "var(--color-bg-primary)",
        borderRight: "1px solid var(--color-separator)",
      }}
    >
      {/* Toolbar */}
      <div className="toolbar" style={{ gap: 8 }}>
        <h2
          className="text-headline flex-1"
          style={{ color: "var(--color-label)" }}
        >
          {filterTitle(filter, feedId)}
          {!loading && (
            <span
              className="text-footnote ml-2"
              style={{ color: "var(--color-label-tertiary)", fontWeight: 400 }}
            >
              {displayed.length}
            </span>
          )}
        </h2>
        <button
          onClick={(e) => { e.stopPropagation(); setSearchOpen(v => !v); }}
          className="flex items-center justify-center rounded-lg transition-colors duration-150"
          style={{
            width: 32, height: 32,
            color: "var(--color-accent)",
            background: searchOpen ? "rgba(0,122,255,0.08)" : "transparent",
          }}
          title="Szukaj"
          onMouseEnter={e => { if (!searchOpen) e.currentTarget.style.background = "rgba(0,122,255,0.08)"; }}
          onMouseLeave={e => { if (!searchOpen) e.currentTarget.style.background = "transparent"; }}
        >
          <Search size={16} />
        </button>
      </div>

      {/* Search bar */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: searchOpen ? 56 : 0,
          transition: "max-height 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          borderBottom: searchOpen ? "1px solid var(--color-separator)" : "none",
        }}
      >
        <div style={{ padding: "8px 16px" }}>
          <input
            autoFocus={searchOpen}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Szukaj w tytułach…"
            className="input"
            style={{ height: 36, fontSize: 15 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </>
        ) : isEmpty ? (
          <EmptyState filter={filter} />
        ) : (
          <ul>
            {displayed.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                userId={userId}
                feedId={feedId}
                filter={filter}
                isSelected={article.id === articleId}
                setCardRef={setCardRef}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState({ filter }: { filter: string | null }) {
  const icon = filter === "bookmarks" ? "🔖" : filter === "read" ? "✓" : "📭";
  const title =
    filter === "unread" ? "Wszystko przeczytane" :
    filter === "bookmarks" ? "Brak zakładek" :
    filter === "read" ? "Brak przeczytanych" :
    "Brak artykułów";
  const desc =
    filter === "unread" ? "Świetna robota — nadążasz za newsami." :
    filter === "bookmarks" ? "Zapisuj artykuły klikając ikonę zakładki." :
    "Odśwież feedy żeby pobrać nowe artykuły.";

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-8 text-center"
      style={{ minHeight: 300 }}
    >
      <span style={{ fontSize: 48, marginBottom: 16, display: "block" }}>{icon}</span>
      <p className="text-title3 mb-2" style={{ color: "var(--color-label)" }}>{title}</p>
      <p className="text-subheadline" style={{ color: "var(--color-label-secondary)" }}>{desc}</p>
    </div>
  );
}
