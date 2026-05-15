"use client";

import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { updateArticle } from "@/lib/firestore";
import type { Article } from "@/types";

interface Props {
  article: Article;
  userId: string;
}

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
    <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => runAction("summarize")}
          disabled={loading}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          Streść
        </button>
        <button
          onClick={() => runAction("translate")}
          disabled={loading}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          Przetłumacz na PL
        </button>
        <button
          onClick={() => runAction("autotag")}
          disabled={loading}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          Auto-tagi
        </button>
        <button
          onClick={() => runAction("sentiment")}
          disabled={loading}
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          Sentyment
        </button>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-100"
        >
          Otwórz oryginał
        </a>
      </div>

      {loading && <p className="text-sm text-gray-400">Przetwarzanie ({activeAction})...</p>}
      {result && (
        <div className="text-sm bg-white dark:bg-gray-800 border rounded-lg p-3 whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
