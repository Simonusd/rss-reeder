"use client";

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
  return (
    <div
      onClick={onActivate}
      className={`w-80 h-full border-r overflow-y-auto bg-white dark:bg-gray-950 shrink-0 transition-shadow ${
        isActive ? "ring-2 ring-inset ring-blue-500" : ""
      }`}
    >
      <div className="p-4 border-b sticky top-0 bg-white dark:bg-gray-950 z-10">
        <h2 className="font-semibold text-sm text-gray-500">
          {filteredArticles.length} artykułów
        </h2>
      </div>

      {loading ? (
        <div className="p-4 text-center text-gray-400 text-sm">Ładowanie...</div>
      ) : filteredArticles.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">Brak artykułów</div>
      ) : (
        <ul>
          {filteredArticles.map((article) => (
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
