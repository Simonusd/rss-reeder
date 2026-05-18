"use client";

import { useState, useEffect } from "react";
import { subscribeToArticles } from "@/lib/firestore";
import type { Article } from "@/types";

export function useArticles(userId: string | null, feedId: string | null = null) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setArticles([]);
      setLoading(false);
      return;
    }

    setArticles([]);
    setLoading(true);

    const unsubscribe = subscribeToArticles(userId, feedId, (a) => {
      const toMs = (v: Article["publishedAt"]) => (v instanceof Date ? v.getTime() : 0);
      const sorted = [...a].sort((x, y) => toMs(y.publishedAt) - toMs(x.publishedAt));
      setArticles(sorted);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId, feedId]);

  return { articles, loading };
}
