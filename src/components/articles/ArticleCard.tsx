"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkIcon, BookmarkCheck } from "lucide-react";
import { markAsRead, toggleBookmark } from "@/lib/firestore";
import type { Article } from "@/types";

interface Props {
  article: Article;
  userId: string;
  feedId: string | null;
  filter: string | null;
  isSelected: boolean;
  setCardRef: (id: string, node: HTMLElement | null) => void;
}

function formatDate(date: Date | { seconds: number }): string {
  const d = date instanceof Date ? date : new Date((date as { seconds: number }).seconds * 1000);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins} min temu`;
  if (hours < 24) return `${hours} godz. temu`;
  if (days === 1) return "wczoraj";
  if (days < 7) return `${days} dni temu`;
  return d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
}

export default function ArticleCard({
  article, userId, feedId, filter, isSelected, setCardRef,
}: Props) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  function handleClick() {
    const params = new URLSearchParams();
    if (feedId) params.set("feedId", feedId);
    if (filter) params.set("filter", filter);
    params.set("articleId", article.id);
    router.push(`/reader?${params.toString()}`);
    if (!article.isRead) {
      markAsRead(userId, article.id, true, article.feedId);
    }
  }

  async function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation();
    await toggleBookmark(userId, article.id, !article.isBookmarked);
  }

  return (
    <li
      ref={(node) => setCardRef(article.id, node)}
      style={{ position: "relative" }}
    >
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "14px 16px 14px 20px",
          borderBottom: "1px solid var(--color-separator)",
          background: isSelected
            ? "rgba(0, 122, 255, 0.06)"
            : hovered
            ? "rgba(0,0,0,0.02)"
            : "transparent",
          borderLeft: isSelected
            ? "3px solid var(--color-accent)"
            : "3px solid transparent",
          transition: "background 0.15s",
          cursor: "pointer",
          position: "relative",
        }}
      >
        {/* Meta row */}
        <div
          className="text-caption mb-1.5 flex items-center gap-1.5"
          style={{ color: "var(--color-label-secondary)" }}
        >
          <span>{formatDate(article.publishedAt)}</span>
          <span>·</span>
          <span>{article.readingTime} min</span>
        </div>

        {/* Title */}
        <p
          className="text-subheadline leading-snug line-clamp-2 mb-1"
          style={{
            color: article.isRead ? "var(--color-label-secondary)" : "var(--color-label)",
            fontWeight: article.isRead ? 400 : 600,
          }}
        >
          {article.title}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Bookmark action — shows on hover */}
        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.15s",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          onClick={handleBookmark}
        >
          {article.isBookmarked ? (
            <BookmarkCheck
              size={16}
              style={{ color: "var(--color-accent-purple)" }}
            />
          ) : (
            <BookmarkIcon
              size={16}
              style={{ color: "var(--color-label-tertiary)" }}
            />
          )}
        </div>
      </button>
    </li>
  );
}
