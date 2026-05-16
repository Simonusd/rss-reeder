"use client";

import { useState } from "react";
import {
  BookOpen, Sparkles, Languages, Tag,
  Share, ExternalLink, RefreshCw, X,
} from "lucide-react";
import type { Article } from "@/types";
import { useSettings } from "@/hooks/useSettings";
import { updateArticle } from "@/lib/firestore";

interface Props {
  article: Article;
  userId: string;
  onContentFetched: (content: string | null) => void;
}

export default function AIToolbar({ article, userId, onContentFetched }: Props) {
  const { settings } = useSettings(userId);
  const [fetchingContent, setFetchingContent] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiActive, setAiActive] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState("");
  const [copied, setCopied] = useState(false);

  async function fetchFullContent() {
    setFetchingContent(true);
    try {
      const res = await fetch(`/api/fetch-article?url=${encodeURIComponent(article.url)}`);
      const data = await res.json();
      if (data.content) onContentFetched(data.content);
    } catch { /* silently fail */ } finally {
      setFetchingContent(false);
    }
  }

  async function runAI(action: "summarize" | "translate" | "autotag") {
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

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: article.title, url: article.url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(article.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const aiDisabled = !settings.aiApiKey || aiLoading || fetchingContent;

  return (
    <>
      <div className="toolbar" style={{ gap: 8, justifyContent: "space-between", marginBottom: 0 }}>
        <span className="text-headline flex-1 truncate" style={{ color: "var(--color-label)" }}>
          {article.title}
        </span>
        <Btn title="Pobierz treść" onClick={fetchFullContent} disabled={fetchingContent || aiLoading}>
          {fetchingContent
            ? <RefreshCw size={16} className="animate-spin" />
            : <BookOpen size={16} />}
        </Btn>
        <Btn title="Streść" onClick={() => runAI("summarize")} disabled={aiDisabled}>
          <Sparkles size={16} className={aiActive === "summarize" && aiLoading ? "animate-spin" : ""} />
        </Btn>
        <Btn title="Przetłumacz" onClick={() => runAI("translate")} disabled={aiDisabled}>
          <Languages size={16} />
        </Btn>
        <Btn title="Dodaj tagi" onClick={() => runAI("autotag")} disabled={aiDisabled}>
          <Tag size={16} />
        </Btn>
        <div style={{ width: 1, height: 18, background: "var(--color-separator)", margin: "0 4px", flexShrink: 0 }} />
        <Btn title="Udostępnij" onClick={share} style={{ color: copied ? "var(--color-accent-green)" : undefined }}>
          <Share size={16} />
        </Btn>
        <Btn title="Otwórz oryginał" as="a" href={article.url} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={16} />
        </Btn>
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
    </>
  );
}

type BtnProps = {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  disabled?: boolean;
} & (
  | { as?: "button"; onClick: () => void; href?: never; target?: never; rel?: never }
  | { as: "a"; href: string; target: string; rel: string; onClick?: never }
);

function Btn({ title, children, style, disabled, as: Tag = "button", ...rest }: BtnProps) {
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
