"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChevronLeft, ExternalLink } from "lucide-react";
import type { Article } from "@/types";
import ReaderMode from "@/components/articles/ReaderMode";
import AIToolbar from "@/components/ai/AIToolbar";

interface Props {
  userId: string;
  articleId: string | null;
  onActivate: () => void;
  viewRef: React.RefObject<HTMLElement | null>;
  iframeMode: boolean;
  onIframeClose: () => void;
}

export default function ArticleView({
  userId, articleId, onActivate, viewRef, iframeMode, onIframeClose,
}: Props) {
  const [article, setArticle] = useState<Article | null>(null);
  const [fetchedContent, setFetchedContent] = useState<string | null>(null);

  useEffect(() => {
    if (!articleId) { setArticle(null); return; }
    getDoc(doc(db(), "users", userId, "articles", articleId)).then((snap) => {
      if (snap.exists()) setArticle({ id: snap.id, ...snap.data() } as Article);
    });
    setFetchedContent(null);
  }, [articleId, userId]);

  const handleContentFetched = useCallback((content: string) => {
    setFetchedContent(content);
  }, []);

  if (!article) {
    return (
      <main
        ref={viewRef}
        onClick={onActivate}
        tabIndex={-1}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg-primary)",
          outline: "none",
        }}
      >
        <div className="text-center px-8">
          <p style={{ fontSize: 48, marginBottom: 16 }}>📖</p>
          <p className="text-title3 mb-2" style={{ color: "var(--color-label)" }}>
            Wybierz artykuł
          </p>
          <p className="text-subheadline" style={{ color: "var(--color-label-secondary)" }}>
            Kliknij artykuł z listy, żeby go przeczytać
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      ref={viewRef}
      onClick={onActivate}
      tabIndex={-1}
      style={{
        flex: 1,
        outline: "none",
        background: "var(--color-bg-primary)",
        overflow: iframeMode ? "hidden" : "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {iframeMode ? (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
          {/* Iframe toolbar */}
          <div
            className="toolbar"
            style={{ gap: 12, justifyContent: "space-between", flexShrink: 0 }}
          >
            <button
              onClick={onIframeClose}
              className="flex items-center gap-1.5 text-sm"
              style={{ color: "var(--color-accent)" }}
            >
              <ChevronLeft size={16} />
              Wróć do readera
            </button>
            <span
              className="text-footnote truncate flex-1 text-right"
              style={{ color: "var(--color-label-secondary)" }}
            >
              {article.url}
            </span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-label-secondary)", flexShrink: 0 }}
            >
              <ExternalLink size={14} />
            </a>
          </div>
          <iframe
            src={`/api/proxy?url=${encodeURIComponent(article.url)}`}
            style={{ width: "100%", flex: 1, border: "none" }}
            title={article.title}
          />
        </div>
      ) : (
        <div style={{ maxWidth: 760, margin: "0 auto", width: "100%", padding: "0 0 80px" }}>
          <AIToolbar article={article} userId={userId} onContentFetched={handleContentFetched} />
          <ReaderMode article={article} contentOverride={fetchedContent} />
        </div>
      )}
    </main>
  );
}
