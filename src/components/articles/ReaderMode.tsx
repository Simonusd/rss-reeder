"use client";

import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import type { Article } from "@/types";

interface Props {
  article: Article;
  contentOverride?: string | null;
}

function formatPublished(date: Date | { seconds: number }): string {
  const d = date instanceof Date ? date : new Date((date as { seconds: number }).seconds * 1000);
  return d.toLocaleDateString("pl-PL", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function ReaderMode({ article, contentOverride }: Props) {
  const [content, setContent] = useState(article.content);
  const [loadingReadable, setLoadingReadable] = useState(false);

  useEffect(() => {
    if (contentOverride) {
      setContent(contentOverride);
      setLoadingReadable(false);
      return;
    }
    setContent(article.content);
    if (!article.content && article.url) {
      setLoadingReadable(true);
      fetch(`/api/fetch-article?url=${encodeURIComponent(article.url)}`)
        .then((r) => r.json())
        .then((data) => { if (data.content) setContent(data.content); })
        .finally(() => setLoadingReadable(false));
    }
  }, [article.id, article.url, article.content, contentOverride]);

  return (
    <article style={{ padding: "40px 48px 96px" }}>
      {/* Title */}
      <h1 className="reader-title">{article.title}</h1>

      {/* Meta */}
      <div className="reader-meta flex items-center flex-wrap gap-3">
        <span>{formatPublished(article.publishedAt)}</span>
        <span>·</span>
        <span>{article.readingTime} min czytania</span>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1"
          style={{ color: "var(--color-accent)", textDecoration: "none" }}
        >
          <ExternalLink size={13} />
          Otwórz oryginał
        </a>
      </div>

      {/* Summary */}
      {article.summary && (
        <div
          style={{
            background: "var(--color-bg-secondary)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
            marginBottom: 32,
            borderLeft: "3px solid var(--color-accent)",
          }}
        >
          <p
            className="text-footnote uppercase tracking-wider mb-2"
            style={{ color: "var(--color-accent)", fontWeight: 600 }}
          >
            Streszczenie AI
          </p>
          <p className="text-subheadline" style={{ color: "var(--color-label)", lineHeight: 1.6 }}>
            {article.summary}
          </p>
        </div>
      )}

      {/* Sentiment */}
      {article.sentiment && (
        <div style={{ marginBottom: 24 }}>
          <SentimentBadge sentiment={article.sentiment} />
        </div>
      )}

      {/* Content */}
      {loadingReadable ? (
        <div style={{ paddingTop: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: i % 5 === 4 ? 12 : 18,
                width: i % 5 === 4 ? "60%" : "100%",
                marginBottom: 12,
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className="reader-content"
          style={{ padding: 0 }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </article>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    positive: { label: "Pozytywny", color: "var(--color-accent-green)", bg: "rgba(52,199,89,0.1)" },
    negative: { label: "Negatywny", color: "var(--color-accent-red)", bg: "rgba(255,59,48,0.1)" },
    neutral:  { label: "Neutralny", color: "var(--color-label-secondary)", bg: "var(--color-bg-secondary)" },
  };
  const s = map[sentiment] ?? map.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: "var(--radius-full)",
        fontSize: 12,
        fontWeight: 600,
        color: s.color,
        background: s.bg,
      }}
    >
      {s.label}
    </span>
  );
}
