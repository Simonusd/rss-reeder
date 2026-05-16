"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronRight, Folder } from "lucide-react";
import type { Feed, Folder as FolderType } from "@/types";
import FeedItem from "./FeedItem";
import ContextMenu from "@/components/ui/ContextMenu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { deleteFolder, updateFolder, updateFeed } from "@/lib/firestore";

interface Props {
  folder: FolderType;
  feeds: Feed[];
  userId: string;
  highlightedKey: string | null;
}

export default function FolderItem({ folder, feeds, userId, highlightedKey }: Props) {
  const [open, setOpen] = useState(true);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(folder.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (feeds.some(f => highlightedKey === `feed:${f.id}`)) setOpen(true);
  }, [highlightedKey, feeds]);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  useEffect(() => {
    if (!renaming) setRenameValue(folder.name);
  }, [folder.name, renaming]);

  const folderHighlighted = highlightedKey === `folder:${folder.id}`;
  const folderUnread = feeds.reduce((s, f) => s + (f.unreadCount ?? 0), 0);

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
  }

  async function handleRenameCommit() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== folder.name) {
      await updateFolder(userId, folder.id, { name: trimmed });
    }
    setRenaming(false);
  }

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); handleRenameCommit(); }
    if (e.key === "Escape") { setRenaming(false); setRenameValue(folder.name); }
  }

  async function handleDelete() {
    await Promise.all([
      deleteFolder(userId, folder.id),
      ...feeds.map(f => updateFeed(userId, f.id, { folderId: null })),
    ]);
  }

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 12px",
    height: 36,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    color: folderHighlighted ? "var(--color-accent)" : "var(--color-label-secondary)",
    background: folderHighlighted ? "rgba(0, 122, 255, 0.08)" : "transparent",
    cursor: "pointer",
    width: "100%",
    border: "none",
    textAlign: "left",
    transition: "background 0.15s",
  };

  return (
    <div>
      <div onContextMenu={handleContextMenu} className="relative">
        {renaming ? (
          <div style={rowStyle}>
            <Folder size={14} style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              onBlur={handleRenameCommit}
              style={{
                flex: 1, background: "transparent", outline: "none",
                borderBottom: "1.5px solid var(--color-accent)",
                minWidth: 0, color: "var(--color-label)", fontSize: 14, fontWeight: 600,
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setOpen(!open)}
            style={rowStyle}
            onMouseEnter={e => {
              if (!folderHighlighted) e.currentTarget.style.background = "rgba(0,0,0,0.04)";
            }}
            onMouseLeave={e => {
              if (!folderHighlighted) e.currentTarget.style.background = "transparent";
            }}
          >
            <ChevronRight
              size={14}
              style={{
                flexShrink: 0,
                transform: open ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
            <Folder size={14} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {folder.name}
            </span>
            {folderUnread > 0 && (
              <span className="badge" style={{ flexShrink: 0 }}>{folderUnread}</span>
            )}
          </button>
        )}

        {menuPos && (
          <ContextMenu
            x={menuPos.x}
            y={menuPos.y}
            onClose={() => setMenuPos(null)}
            items={[
              { label: "Zmień nazwę", onClick: () => setRenaming(true) },
              { label: "Usuń folder", onClick: () => setConfirmDelete(true), danger: true },
            ]}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            message={`Usunąć folder „${folder.name}"? Feedy staną się nieprzypisane.`}
            onConfirm={() => { setConfirmDelete(false); handleDelete(); }}
            onCancel={() => setConfirmDelete(false)}
          />
        )}
      </div>

      {open && (
        <div style={{ paddingLeft: 12 }}>
          {feeds.map((feed) => (
            <FeedItem
              key={feed.id}
              feed={feed}
              userId={userId}
              highlighted={highlightedKey === `feed:${feed.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
