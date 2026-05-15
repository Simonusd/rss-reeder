"use client";

import { useState } from "react";
import type { Feed, Folder } from "@/types";
import FeedItem from "./FeedItem";

interface Props {
  folder: Folder;
  feeds: Feed[];
  userId: string;
}

export default function FolderItem({ folder, feeds }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-sm font-medium"
      >
        <span>{open ? "▾" : "▸"}</span>
        <span className="truncate">{folder.name}</span>
      </button>
      {open && (
        <div className="pl-4">
          {feeds.map((feed) => (
            <FeedItem key={feed.id} feed={feed} />
          ))}
        </div>
      )}
    </div>
  );
}
