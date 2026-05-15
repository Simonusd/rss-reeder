"use client";

import { useState, useEffect } from "react";
import type { Feed, Folder } from "@/types";
import FeedItem from "./FeedItem";

interface Props {
  folder: Folder;
  feeds: Feed[];
  userId: string;
  highlightedKey: string | null;
}

export default function FolderItem({ folder, feeds, highlightedKey }: Props) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (feeds.some(f => highlightedKey === `feed:${f.id}`)) {
      setOpen(true);
    }
  }, [highlightedKey, feeds]);

  const folderHighlighted = highlightedKey === `folder:${folder.id}`;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-sm font-medium ${
          folderHighlighted ? "bg-blue-100 dark:bg-blue-900" : ""
        }`}
      >
        <span>{open ? "▾" : "▸"}</span>
        <span className="truncate">{folder.name}</span>
      </button>
      {open && (
        <div className="pl-4">
          {feeds.map((feed) => (
            <FeedItem
              key={feed.id}
              feed={feed}
              highlighted={highlightedKey === `feed:${feed.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
