export type Theme = "light" | "dark" | "sepia";
export type AIProvider = "claude" | "openai" | "gemini";
export type Sentiment = "positive" | "neutral" | "negative";
export type AIAction = "summarize" | "translate" | "autotag" | "sentiment" | "chat";

export interface UserSettings {
  readerMode: boolean;
  theme: Theme;
  fontSize: number;
  fontFamily: "sans-serif" | "serif";
  refreshInterval: number;
  autoTranslate: boolean;
  autoSummarize: boolean;
  aiProvider: AIProvider;
  aiModel: string;
  aiApiKey: string;
}

export interface Feed {
  id: string;
  url: string;
  title: string;
  description: string;
  folderId: string | null;
  lastFetched: Date | null;
  unreadCount: number;
  favicon: string;
}

export interface Folder {
  id: string;
  name: string;
  order: number;
}

export interface Article {
  id: string;
  feedId: string;
  title: string;
  url: string;
  content: string;
  summary: string | null;
  publishedAt: Date;
  isRead: boolean;
  isBookmarked: boolean;
  tags: string[];
  readingTime: number;
  sentiment: Sentiment | null;
}

export interface Keyword {
  id: string;
  word: string;
  active: boolean;
}

export interface AIRequest {
  action: AIAction;
  content: string;
  provider: AIProvider;
  apiKey: string;
  model: string;
  chatHistory?: { role: "user" | "assistant"; content: string }[];
}
