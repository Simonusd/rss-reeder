"use client";

import { useSearchParams } from "next/navigation";
import { useArticles } from "@/hooks/useArticles";
import ArticleCard from "@/components/articles/ArticleCard";

interface Props {
  userId: string;
}

export default function ArticleList({ userId }: Props) {
  const searchParams = useSearchParams();
  const feedId = searchParams.get("feedId");
  const filter = searchParams.get("filter");
  const { articles, loading } = useArticles(userId, feedId);

  const filtered = articles.filter((a) => {
    if (filter === "unread") return !a.isRead;
    if (filter === "bookmarks") return a.isBookmarked;
    return true;
  });

  return (
    <div className="w-80 h-full border-r overflow-y-auto bg-white dark:bg-gray-950 shrink-0">
      <div className="p-4 border-b sticky top-0 bg-white dark:bg-gray-950 z-10">
        <h2 className="font-semibold text-sm text-gray-500">
          {filtered.length} artykułów
        </h2>
      </div>

      {loading ? (
        <div className="p-4 text-center text-gray-400 text-sm">Ładowanie...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">Brak artykułów</div>
      ) : (
        <ul>
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} userId={userId} />
          ))}
        </ul>
      )}
    </div>
  );
}
