"use client";

import { useState, useEffect } from "react";
import type { Article } from "@/types";

interface Props {
  article: Article;
}

export default function ReaderMode({ article }: Props) {
  const [content, setContent] = useState(article.content);
  const [loadingReadable, setLoadingReadable] = useState(false);

  useEffect(() => {
    setContent(article.content);
    if (!article.content && article.url) {
      setLoadingReadable(true);
      fetch(`/api/fetch-article?url=${encodeURIComponent(article.url)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.content) setContent(data.content);
        })
        .finally(() => setLoadingReadable(false));
    }
  }, [article.id, article.url, article.content]);

  return (
    <article className="mt-6">
      <h1 className="text-2xl font-bold leading-tight mb-2">{article.title}</h1>
      <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
        <span>{article.readingTime} min czytania</span>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Otwórz oryginał
        </a>
      </div>

      {loadingReadable ? (
        <p className="text-gray-400">Pobieranie treści...</p>
      ) : (
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </article>
  );
}
