"use client";

import { useState } from "react";
import { X, Rss } from "lucide-react";
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
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="modal modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20, gap: 12 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: "var(--radius-md)",
              background: "rgba(0,122,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Rss size={20} style={{ color: "var(--color-accent)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="text-headline" style={{ color: "var(--color-label)" }}>
              Dodaj feed RSS
            </h2>
            <p className="text-footnote" style={{ color: "var(--color-label-secondary)" }}>
              Wklej URL feedu RSS lub Atom
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "var(--radius-full)",
              background: "var(--color-bg-secondary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "none", cursor: "pointer",
              color: "var(--color-label-secondary)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              className="text-footnote"
              style={{
                display: "block", marginBottom: 6,
                color: "var(--color-label-secondary)", fontWeight: 500,
              }}
            >
              URL feedu
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/feed.rss"
              required
              className="input"
            />
          </div>

          {error && (
            <p
              className="text-footnote mb-4"
              style={{ color: "var(--color-accent-red)" }}
            >
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ height: 44 }}
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ height: 44, minWidth: 100 }}
            >
              {loading ? "Dodawanie…" : "Dodaj feed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
