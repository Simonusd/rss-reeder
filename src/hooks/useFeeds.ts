"use client";

import { useState, useEffect } from "react";
import { subscribeToFeeds, subscribeToFolders } from "@/lib/firestore";
import type { Feed, Folder } from "@/types";

export function useFeeds(userId: string | null) {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setFeeds([]);
      setFolders([]);
      setLoading(false);
      return;
    }

    const unsubFeeds = subscribeToFeeds(userId, (f) => {
      setFeeds(f);
      setLoading(false);
    });
    const unsubFolders = subscribeToFolders(userId, setFolders);

    return () => {
      unsubFeeds();
      unsubFolders();
    };
  }, [userId]);

  return { feeds, folders, loading };
}
