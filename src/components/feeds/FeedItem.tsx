"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Rss } from "lucide-react";
import type { Feed } from "@/types";
import ContextMenu from "@/components/ui/ContextMenu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { updateFeed, deleteFeed } from "@/lib/firestore";

interface Props {
  feed: Feed;
  userId: string;
  highlighted: boolean;
}

export default function FeedItem({ feed, userId, highlighted }: Props) {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(feed.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  useEffect(() => {
    if (!renaming) setRenameValue(feed.title);
  }, [feed.title, renaming]);

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
  }

  async function handleRenameCommit() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== feed.title) {
      await updateFeed(userId, feed.id, { title: trimmed });
    }
    setRenaming(false);
  }

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); handleRenameCommit(); }
    if (e.key === "Escape") { setRenaming(false); setRenameValue(feed.title); }
  }

  async function handleDelete() {
    await deleteFeed(userId, feed.id);
  }

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 12px",
    height: 36,
    borderRadius: 8,
    fontSize: 14,
    color: highlighted ? "var(--color-accent)" : "var(--color-label)",
    background: highlighted ? "rgba(0, 122, 255, 0.08)" : "transparent",
    fontWeight: highlighted ? 600 : 400,
    transition: "background 0.15s, color 0.15s",
    textDecoration: "none",
    width: "100%",
  };

  return (
    <div onContextMenu={handleContextMenu} className="relative">
      {renaming ? (
        <div style={itemStyle}>
          {feed.favicon ? (
            <img
              src={feed.favicon}
              alt=""
              style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0 }}
            />
          ) : (
            <Rss size={14} style={{ flexShrink: 0, color: "var(--color-label-tertiary)" }} />
          )}
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleRenameCommit}
            style={{
              flex: 1,
              background: "transparent",
              outline: "none",
              borderBottom: "1.5px solid var(--color-accent)",
              minWidth: 0,
              color: "var(--color-label)",
              fontSize: 14,
            }}
          />
        </div>
      ) : (
        <Link
          href={`/reader?feedId=${feed.id}`}
          style={itemStyle}
          onMouseEnter={e => {
            if (!highlighted) e.currentTarget.style.background = "rgba(0,0,0,0.04)";
          }}
          onMouseLeave={e => {
            if (!highlighted) e.currentTarget.style.background = "transparent";
          }}
        >
          {feed.favicon ? (
            <img
              src={feed.favicon}
              alt=""
              style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0 }}
            />
          ) : (
            <Rss size={14} style={{ flexShrink: 0, color: "var(--color-label-tertiary)" }} />
          )}
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {feed.title}
          </span>
          {(feed.unreadCount ?? 0) > 0 && (
            <span className="badge" style={{ flexShrink: 0 }}>
              {feed.unreadCount}
            </span>
          )}
        </Link>
      )}

      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onClose={() => setMenuPos(null)}
          items={[
            { label: "Zmień nazwę", onClick: () => setRenaming(true) },
            { label: "Usuń feed", onClick: () => setConfirmDelete(true), danger: true },
          ]}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Usunąć feed „${feed.title}"?`}
          onConfirm={() => { setConfirmDelete(false); handleDelete(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
