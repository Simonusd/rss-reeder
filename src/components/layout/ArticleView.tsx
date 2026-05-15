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
}

export default function ArticleView({ userId, articleId, isActive, onActivate, viewRef }: Props) {
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
      className={`flex-1 overflow-y-auto outline-none transition-shadow ${ringClass}`}
    >
      <div className="max-w-3xl mx-auto px-6 py-8">
        <AIToolbar article={article} userId={userId} />
        <ReaderMode article={article} />
      </div>
    </main>
  );
}
