import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export interface ReadableArticle {
  title: string;
  content: string;
  textContent: string;
  excerpt: string;
  byline: string | null;
  length: number;
}

export async function extractArticle(url: string): Promise<ReadableArticle> {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; RSSReader/1.0)" },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    throw new Error("Nie udało się wyodrębnić treści artykułu");
  }

  return article;
}
