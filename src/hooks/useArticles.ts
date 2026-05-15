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

    const unsubscribe = subscribeToArticles(userId, feedId, (a) => {
      setArticles(a);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId, feedId]);

  return { articles, loading };
}
