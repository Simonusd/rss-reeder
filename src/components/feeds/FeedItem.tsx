"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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

  // Keep renameValue in sync when feed title changes externally
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

  const baseClass = `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
    highlighted ? "bg-blue-100 dark:bg-blue-900" : ""
  }`;

  return (
    <div onContextMenu={handleContextMenu} className="relative">
      {renaming ? (
        <div className={`${baseClass} hover:bg-gray-200 dark:hover:bg-gray-800`}>
          {feed.favicon && <img src={feed.favicon} alt="" className="w-4 h-4 rounded shrink-0" />}
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleRenameCommit}
            className="flex-1 bg-transparent outline-none border-b border-blue-500 min-w-0"
          />
        </div>
      ) : (
        <Link
          href={`/reader?feedId=${feed.id}`}
          className={`${baseClass} hover:bg-gray-200 dark:hover:bg-gray-800`}
        >
          {feed.favicon && <img src={feed.favicon} alt="" className="w-4 h-4 rounded shrink-0" />}
          <span className="truncate flex-1">{feed.title}</span>
          {feed.unreadCount > 0 && (
            <span className="text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5 shrink-0">
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
            { label: "Usuń", onClick: () => setConfirmDelete(true), danger: true },
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
