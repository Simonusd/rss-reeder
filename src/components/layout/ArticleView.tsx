"use client";

import { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ChevronLeft, ExternalLink, Share,
  BookOpen, Sparkles, Languages, Tag, RefreshCw, X,
} from "lucide-react";
import type { Article } from "@/types";
import ReaderMode from "@/components/articles/ReaderMode";
import { useSettings } from "@/hooks/useSettings";
import { updateArticle } from "@/lib/firestore";

interface Props {
  className?: string;
  userId: string;
  articleId: string | null;
  onActivate: () => void;
  viewRef: React.RefObject<HTMLElement | null>;
  iframeMode: boolean;
  onIframeClose: () => void;
  onBack?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function ArticleView({
  className, userId, articleId, onActivate, viewRef, iframeMode, onIframeClose, onBack, onNext, onPrev,
}: Props) {
  const { settings } = useSettings(userId);

  const [article, setArticle] = useState<Article | null>(null);
  const [fetchedContent, setFetchedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fetchingContent, setFetchingContent] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiActive, setAiActive] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState("");

  useEffect(() => {
    if (!articleId) { setArticle(null); return; }
    let mounted = true;
    getDoc(doc(db(), "users", userId, "articles", articleId)).then((snap) => {
      if (mounted && snap.exists()) setArticle({ id: snap.id, ...snap.data() } as Article);
    });
    setFetchedContent(null);
    setAiResult("");
    setAiActive(null);
    setFetchingContent(false);
    return () => { mounted = false; };
  }, [articleId, userId]);

  async function share(url: string, title: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function fetchFullContent() {
    if (!article) return;
    setFetchingContent(true);
    try {
      const res = await fetch(`/api/fetch-article?url=${encodeURIComponent(article.url)}`);
      const data = await res.json();
      if (data.content) setFetchedContent(data.content);
    } catch { /* silently fail */ } finally {
      setFetchingContent(false);
    }
  }

  async function runAI(action: "summarize" | "translate" | "autotag") {
    if (!article) return;
    setAiLoading(true);
    setAiActive(action);
    setAiResult("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          content: article.content,
          provider: settings.aiProvider,
          apiKey: settings.aiApiKey,
          model: settings.aiModel,
        }),
      });
      const data = await res.json();
      setAiResult(data.result ?? data.error ?? "");
      if (action === "summarize") await updateArticle(userId, article.id, { summary: data.result });
      if (action === "autotag") await updateArticle(userId, article.id, { tags: data.result });
    } catch {
      setAiResult("Błąd podczas wywołania AI");
    } finally {
      setAiLoading(false);
    }
  }

  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 50) onNext?.();
    else if (delta < -50) onPrev?.();
  };

  if (!article) {
    return (
      <main
        ref={viewRef}
        onClick={onActivate}
        tabIndex={-1}
        className={className}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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
        <button
          className="mobile-only btn-ghost"
          onClick={onBack}
          style={{
            position: "absolute", top: 12, left: 12,
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 15, fontWeight: 500,
          }}
        >
          <ChevronLeft size={16} /> Artykuły
        </button>
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

  const aiDisabled = !settings.aiApiKey || aiLoading || fetchingContent;

  return (
    <main
      ref={viewRef}
      onClick={onActivate}
      tabIndex={-1}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        flex: 1,
        outline: "none",
        background: "var(--color-bg-primary)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {iframeMode ? (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
          <div
            className="toolbar"
            style={{ gap: 8, justifyContent: "space-between", flexShrink: 0 }}
          >
            <button
              onClick={onIframeClose}
              className="flex items-center gap-1.5"
              style={{ color: "var(--color-accent)", fontSize: 14, fontWeight: 500 }}
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
            <ToolbarIconButton
              title="Udostępnij"
              onClick={() => share(article.url, article.title)}
              style={{ color: copied ? "var(--color-accent-green)" : undefined }}
            >
              <Share size={16} />
            </ToolbarIconButton>
            <ToolbarIconButton
              title="Otwórz oryginał"
              as="a"
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={16} />
            </ToolbarIconButton>
          </div>
          <iframe
            src={`/api/proxy?url=${encodeURIComponent(article.url)}`}
            style={{ width: "100%", flex: 1, border: "none" }}
            title={article.title}
          />
        </div>
      ) : (
        <>
          <div className="toolbar" style={{ gap: 8, justifyContent: "space-between" }}>
            <button
              className="mobile-only flex items-center gap-1"
              onClick={onBack}
              style={{ color: "var(--color-accent)", fontSize: 15, fontWeight: 500, flexShrink: 0 }}
            >
              <ChevronLeft size={16} /> Artykuły
            </button>
            <span
              className="text-headline flex-1 truncate desktop-only"
              style={{ color: "var(--color-label)" }}
            >
              {article.title}
            </span>
            <ToolbarIconButton
              title="Pobierz treść"
              onClick={fetchFullContent}
              disabled={fetchingContent || aiLoading}
            >
              {fetchingContent
                ? <RefreshCw size={16} className="animate-spin" />
                : <BookOpen size={16} />}
            </ToolbarIconButton>
            <ToolbarIconButton
              title="Streść"
              onClick={() => runAI("summarize")}
              disabled={aiDisabled}
            >
              <Sparkles size={16} className={aiActive === "summarize" && aiLoading ? "animate-spin" : ""} />
            </ToolbarIconButton>
            <ToolbarIconButton
              title="Przetłumacz"
              onClick={() => runAI("translate")}
              disabled={aiDisabled}
            >
              <Languages size={16} />
            </ToolbarIconButton>
            <ToolbarIconButton
              title="Dodaj tagi"
              onClick={() => runAI("autotag")}
              disabled={aiDisabled}
            >
              <Tag size={16} />
            </ToolbarIconButton>
            <div style={{ width: 1, height: 18, background: "var(--color-separator)", margin: "0 4px", flexShrink: 0 }} />
            <ToolbarIconButton
              title="Udostępnij"
              onClick={() => share(article.url, article.title)}
              style={{ color: copied ? "var(--color-accent-green)" : undefined }}
            >
              <Share size={16} />
            </ToolbarIconButton>
            <ToolbarIconButton
              title="Otwórz oryginał"
              as="a"
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={16} />
            </ToolbarIconButton>
          </div>

          {aiResult && (
            <div
              style={{
                background: "var(--color-material-thick)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid var(--color-separator)",
                padding: "12px 16px",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                flexShrink: 0,
              }}
            >
              <p
                className="text-footnote"
                style={{ flex: 1, color: "var(--color-label)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}
              >
                {aiResult}
              </p>
              <button
                onClick={() => setAiResult("")}
                style={{
                  color: "var(--color-label-tertiary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ maxWidth: 760, margin: "0 auto", width: "100%", padding: "0 0 80px" }}>
              <ReaderMode article={article} contentOverride={fetchedContent} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}

type ToolbarIconButtonProps = {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  disabled?: boolean;
} & (
  | { as?: "button"; onClick: () => void; href?: never; target?: never; rel?: never }
  | { as: "a"; href: string; target: string; rel: string; onClick?: never }
);

function ToolbarIconButton({ title, children, style, disabled, as: Tag = "button", ...rest }: ToolbarIconButtonProps) {
  const [hovered, setHovered] = useState(false);
  const base: React.CSSProperties = {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    background: hovered && !disabled ? "rgba(0,122,255,0.08)" : "transparent",
    color: "var(--color-accent)",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    textDecoration: "none",
    flexShrink: 0,
    opacity: disabled ? 0.35 : 1,
    transition: "background 0.15s, opacity 0.15s",
    ...style,
  };
  return (
    <Tag
      title={title}
      style={base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...(Tag === "button" ? { disabled } : {})}
      {...rest}
    >
      {children}
    </Tag>
  );
}
