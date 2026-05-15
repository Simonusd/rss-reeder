"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { markAsRead } from "@/lib/firestore";
import type { Article } from "@/types";

interface Props {
  article: Article;
  userId: string;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "dziś";
  if (days === 1) return "wczoraj";
  return `${days} dni temu`;
}

export default function ArticleCard({ article, userId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSelected = searchParams.get("articleId") === article.id;

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("articleId", article.id);
    router.push(`/reader?${params.toString()}`);
    if (!article.isRead) {
      markAsRead(userId, article.id, true);
    }
  }

  return (
    <li>
      <button
        onClick={handleClick}
        className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
          isSelected ? "bg-blue-50 dark:bg-blue-950 border-l-2 border-l-blue-600" : ""
        } ${!article.isRead ? "font-semibold" : "text-gray-500"}`}
      >
        <p className="text-sm leading-snug line-clamp-2">{article.title}</p>
        <p className="text-xs text-gray-400 mt-1">
          {article.readingTime} min · {formatDate(article.publishedAt)}
        </p>
      </button>
    </li>
  );
}
