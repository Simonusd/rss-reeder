"use client";

import { useState } from "react";
import { addFeed, saveArticles } from "@/lib/firestore";
import type { Article } from "@/types";

interface Props {
  userId: string;
  onClose: () => void;
}

export default function AddFeedModal({ userId, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/fetch-feed?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const feedId = await addFeed(userId, {
        url,
        title: data.meta.title,
        description: data.meta.description,
        folderId: null,
        lastFetched: new Date(),
        unreadCount: data.articles.length,
        favicon: data.meta.favicon,
      });

      const articles = (data.articles as Omit<Article, "id">[]).map((a) => ({ ...a, feedId }));
      await saveArticles(userId, articles);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd podczas dodawania feedu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Dodaj feed RSS</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">URL feedu</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/rss"
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Dodawanie..." : "Dodaj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
