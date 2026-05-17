import Parser from "rss-parser";
import type { Article } from "@/types";
import { isSafeUrl, safeFetch } from "@/lib/validate-url";

const parser = new Parser({ timeout: 10000 });

export interface FeedMeta {
  title: string;
  description: string;
  favicon: string;
}

const RSS_CONTENT_TYPES = ["application/rss+xml", "application/atom+xml", "application/xml", "text/xml"];

async function discoverFeedUrl(url: string): Promise<string> {
  const res = await safeFetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; RSSReader/1.0)" },
  });

  const contentType = res.headers.get("content-type") ?? "";

  // URL już wskazuje na feed
  if (RSS_CONTENT_TYPES.some((t) => contentType.includes(t))) {
    return url;
  }

  // Spróbuj znaleźć link RSS/Atom w HTML
  const html = await res.text();
  const linkRe = /<link([^>]+)>/gi;
  let match;

  while ((match = linkRe.exec(html)) !== null) {
    const attrs = match[1];
    if (/type=["'](application\/rss\+xml|application\/atom\+xml)["']/i.test(attrs)) {
      const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        const feedUrl = hrefMatch[1];
        // Obsługa względnych URL-i
        const resolved = feedUrl.startsWith("http") ? feedUrl : new URL(feedUrl, new URL(url).origin).href;
        if (!isSafeUrl(resolved)) throw new Error("Niedozwolony URL feedu");
        return resolved;
      }
    }
  }

  throw new Error(
    "Nie znaleziono feedu RSS/Atom na tej stronie. Podaj bezpośredni URL feedu (np. kończący się na /feed lub /rss)."
  );
}

export async function parseFeed(url: string): Promise<{ meta: FeedMeta; articles: Omit<Article, "id">[] }> {
  // Spróbuj bezpośrednio — jeśli się nie uda, znajdź URL feedu z HTML strony
  let feedUrl = url;
  try {
    await parser.parseURL(url);
  } catch {
    feedUrl = await discoverFeedUrl(url);
  }

  const feed = await parser.parseURL(feedUrl);

  const hostname = new URL(feedUrl).hostname;
  const meta: FeedMeta = {
    title: feed.title ?? url,
    description: feed.description ?? "",
    favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`,
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
