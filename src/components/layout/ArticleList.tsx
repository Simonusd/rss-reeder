"use client";

import { useState, useEffect } from "react";
import ArticleCard from "@/components/articles/ArticleCard";
import type { Article } from "@/types";

interface Props {
  userId: string;
  feedId: string | null;
  filter: string | null;
  articleId: string | null;
  isActive: boolean;
  onActivate: () => void;
  filteredArticles: Article[];
  loading: boolean;
  setCardRef: (id: string, node: HTMLElement | null) => void;
}

export default function ArticleList({
  userId,
  feedId,
  filter,
  articleId,
  isActive,
  onActivate,
  filteredArticles,
  loading,
  setCardRef,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSearchQuery("");
    setSearchOpen(false);
  }, [feedId, filter]);

  const displayed = searchQuery.trim()
    ? filteredArticles.filter((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredArticles;

  return (
    <div
      onClick={onActivate}
      className={`w-80 h-full border-r overflow-y-auto bg-white dark:bg-gray-950 shrink-0 transition-shadow ${
        isActive ? "ring-2 ring-inset ring-blue-500" : ""
      }`}
    >
      <div className="px-4 pt-4 pb-3 border-b sticky top-0 bg-white dark:bg-gray-950 z-10">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-gray-500">
            {displayed.length} artykułów
          </h2>
          <button
            onClick={(e) => { e.stopPropagation(); setSearchOpen((v) => !v); }}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              searchOpen ? "text-blue-500" : "text-gray-400"
            }`}
            title="Szukaj"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-200 ${searchOpen ? "max-h-10 mt-2" : "max-h-0"}`}>
          <input
            autoFocus={searchOpen}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Szukaj w tytułach..."
            className="w-full text-sm px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-center text-gray-400 text-sm">Ładowanie...</div>
      ) : displayed.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">
          {searchQuery.trim() ? "Brak wyników wyszukiwania" : "Brak artykułów"}
        </div>
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
  );
}
