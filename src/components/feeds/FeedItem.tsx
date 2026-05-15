"use client";

import Link from "next/link";
import type { Feed } from "@/types";

interface Props {
  feed: Feed;
  highlighted: boolean;
}

export default function FeedItem({ feed, highlighted }: Props) {
  return (
    <Link
      href={`/reader?feedId=${feed.id}`}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-sm ${
        highlighted ? "bg-blue-100 dark:bg-blue-900" : ""
      }`}
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
