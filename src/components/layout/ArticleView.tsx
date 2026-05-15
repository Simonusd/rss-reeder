"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Article } from "@/types";
import ReaderMode from "@/components/articles/ReaderMode";
import AIToolbar from "@/components/ai/AIToolbar";

interface Props {
  userId: string;
}

export default function ArticleView({ userId }: Props) {
  const searchParams = useSearchParams();
  const articleId = searchParams.get("articleId");
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (!articleId) {
      setArticle(null);
      return;
    }
    getDoc(doc(db, "users", userId, "articles", articleId)).then((snap) => {
      if (snap.exists()) setArticle({ id: snap.id, ...snap.data() } as Article);
    });
  }, [articleId, userId]);

  if (!article) {
    return (
      <main className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Wybierz artykuł z listy
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <AIToolbar article={article} userId={userId} />
        <ReaderMode article={article} />
      </div>
    </main>
  );
}
