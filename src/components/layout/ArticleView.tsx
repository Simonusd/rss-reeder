"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Article } from "@/types";
import ReaderMode from "@/components/articles/ReaderMode";
import AIToolbar from "@/components/ai/AIToolbar";

interface Props {
  userId: string;
  articleId: string | null;
  isActive: boolean;
  onActivate: () => void;
  viewRef: React.RefObject<HTMLElement | null>;
  iframeMode: boolean;
  onIframeClose: () => void;
}

export default function ArticleView({ userId, articleId, isActive, onActivate, viewRef, iframeMode, onIframeClose }: Props) {
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (!articleId) {
      setArticle(null);
      return;
    }
    getDoc(doc(db(), "users", userId, "articles", articleId)).then((snap) => {
      if (snap.exists()) setArticle({ id: snap.id, ...snap.data() } as Article);
    });
  }, [articleId, userId]);

  const ringClass = isActive ? "ring-2 ring-inset ring-blue-500" : "";

  if (!article) {
    return (
      <main
        ref={viewRef}
        onClick={onActivate}
        tabIndex={-1}
        className={`flex-1 flex items-center justify-center text-gray-400 text-sm outline-none transition-shadow ${ringClass}`}
      >
        Wybierz artykuł z listy
      </main>
    );
  }

  return (
    <main
      ref={viewRef}
      onClick={onActivate}
      tabIndex={-1}
      className={`flex-1 outline-none transition-shadow ${iframeMode ? "overflow-hidden" : "overflow-y-auto"} ${ringClass}`}
    >
      {iframeMode ? (
        <div className="relative w-full h-full flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 shrink-0">
            <button
              onClick={onIframeClose}
              className="flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
            >
              ← Wróć do readera
            </button>
            <span className="truncate">{article.url}</span>
          </div>
          <iframe
            src={`/api/proxy?url=${encodeURIComponent(article.url)}`}
            className="w-full flex-1 border-0"
            title={article.title}
          />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-8">
          <AIToolbar article={article} userId={userId} />
          <ReaderMode article={article} />
        </div>
      )}
    </main>
  );
}
