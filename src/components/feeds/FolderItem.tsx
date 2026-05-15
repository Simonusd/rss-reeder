"use client";

import { useState, useEffect, useRef } from "react";
import type { Feed, Folder } from "@/types";
import FeedItem from "./FeedItem";
import ContextMenu from "@/components/ui/ContextMenu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { deleteFolder, updateFolder, updateFeed } from "@/lib/firestore";

interface Props {
  folder: Folder;
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

  const buttonClass = `w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-sm font-medium ${
    folderHighlighted ? "bg-blue-100 dark:bg-blue-900" : ""
  }`;

  return (
    <div>
      <div onContextMenu={handleContextMenu} className="relative">
        {renaming ? (
          <div className={buttonClass}>
            <span>{open ? "▾" : "▸"}</span>
            <input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              onBlur={handleRenameCommit}
              className="flex-1 bg-transparent outline-none border-b border-blue-500 font-medium min-w-0"
            />
          </div>
        ) : (
          <button onClick={() => setOpen(!open)} className={buttonClass}>
            <span>{open ? "▾" : "▸"}</span>
            <span className="truncate">{folder.name}</span>
          </button>
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
            message={`Usunąć folder „${folder.name}"? Feedy z niego staną się nieprzypisane.`}
            onConfirm={() => { setConfirmDelete(false); handleDelete(); }}
            onCancel={() => setConfirmDelete(false)}
          />
        )}
      </div>

      {open && (
        <div className="pl-4">
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
