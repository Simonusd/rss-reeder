import Parser from "rss-parser";
import type { Article } from "@/types";

const parser = new Parser({
  timeout: 10000,
});

export interface FeedMeta {
  title: string;
  description: string;
  favicon: string;
}

export async function parseFeed(url: string): Promise<{ meta: FeedMeta; articles: Omit<Article, "id">[] }> {
  const feed = await parser.parseURL(url);

  const meta: FeedMeta = {
    title: feed.title ?? url,
    description: feed.description ?? "",
    favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`,
  };

  const articles: Omit<Article, "id">[] = (feed.items ?? []).map((item) => {
    const wordCount = (item.contentSnippet ?? item.content ?? "").split(/\s+/).length;
    return {
      feedId: "",
      title: item.title ?? "Bez tytułu",
      url: item.link ?? "",
      content: item.content ?? item.contentSnippet ?? "",
      summary: null,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      isRead: false,
      isBookmarked: false,
      tags: [],
      readingTime: Math.max(1, Math.ceil(wordCount / 200)),
      sentiment: null,
    };
  });

  return { meta, articles };
}
