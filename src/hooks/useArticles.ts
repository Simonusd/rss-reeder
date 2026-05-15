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
      const sorted = [...a].sort((x, y) => {
        const xd = x.publishedAt instanceof Date ? x.publishedAt : new Date(x.publishedAt as string);
        const yd = y.publishedAt instanceof Date ? y.publishedAt : new Date(y.publishedAt as string);
        return yd.getTime() - xd.getTime();
      });
      setArticles(sorted);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId, feedId]);

  return { articles, loading };
}
