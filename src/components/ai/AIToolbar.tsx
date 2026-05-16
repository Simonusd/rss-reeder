"use client";

import { useState } from "react";
import { Sparkles, Languages, MessageSquare, ExternalLink, Tag } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { updateArticle } from "@/lib/firestore";
import type { Article } from "@/types";

interface Props {
  article: Article;
  userId: string;
}

const ACTIONS = [
  { key: "summarize",  label: "Streść",       icon: Sparkles },
  { key: "translate",  label: "Przetłumacz",  icon: Languages },
  { key: "autotag",    label: "Tagi",         icon: Tag },
  { key: "sentiment",  label: "Sentyment",    icon: MessageSquare },
] as const;

export default function AIToolbar({ article, userId }: Props) {
  const { settings } = useSettings(userId);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  if (!settings.aiApiKey) return null;

  async function runAction(action: string) {
    setLoading(true);
    setActiveAction(action);
    setResult("");

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
      setResult(data.result ?? data.error ?? "");

      if (action === "summarize") {
        await updateArticle(userId, article.id, { summary: data.result });
      }
      if (action === "sentiment") {
        await updateArticle(userId, article.id, { sentiment: data.result?.trim().toLowerCase() });
      }
    } catch {
      setResult("Błąd podczas wywołania AI");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        margin: "24px 48px 0",
        borderRadius: 12,
        border: "1px solid var(--color-separator)",
        background: "var(--color-material-thick)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        overflow: "hidden",
      }}
    >
      {/* Button row */}
      <div style={{ display: "flex", alignItems: "center", padding: "8px 12px", gap: 6, flexWrap: "wrap" }}>
        {ACTIONS.map(({ key, label, icon: Icon }) => (
          <AIButton
            key={key}
            label={label}
            icon={<Icon size={14} />}
            active={activeAction === key && loading}
            onClick={() => runAction(key)}
            disabled={loading}
          />
        ))}
        <div style={{ flex: 1 }} />
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            height: 32,
            padding: "0 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-label-secondary)",
            background: "transparent",
            textDecoration: "none",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <ExternalLink size={13} />
          Oryginał
        </a>
      </div>

      {/* Result */}
      {(loading || result) && (
        <div
          style={{
            borderTop: "1px solid var(--color-separator)",
            padding: "12px 16px",
          }}
        >
          {loading ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div className="skeleton" style={{ height: 14, width: 200 }} />
              <div className="skeleton" style={{ height: 14, width: 140 }} />
            </div>
          ) : (
            <p
              className="text-footnote"
              style={{
                color: "var(--color-label)",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {result}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function AIButton({
  label, icon, active, onClick, disabled,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 32,
        padding: "0 12px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        color: active ? "white" : "var(--color-accent)",
        background: active
          ? "var(--color-accent)"
          : hovered
          ? "rgba(0,122,255,0.15)"
          : "rgba(0,122,255,0.10)",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled && !active ? 0.5 : 1,
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
