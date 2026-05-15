"use client";

import Link from "next/link";
import type { Feed } from "@/types";

interface Props {
  feed: Feed;
}

export default function FeedItem({ feed }: Props) {
  return (
    <Link
      href={`/reader?feedId=${feed.id}`}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-sm"
    >
      {feed.favicon && <img src={feed.favicon} alt="" className="w-4 h-4 rounded" />}
      <span className="truncate flex-1">{feed.title}</span>
      {feed.unreadCount > 0 && (
        <span className="text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5">
          {feed.unreadCount}
        </span>
      )}
    </Link>
  );
}
