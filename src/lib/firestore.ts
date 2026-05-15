import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Feed, Folder, Article, UserSettings, Keyword } from "@/types";

// Settings
export async function getSettings(userId: string): Promise<UserSettings | null> {
  const snap = await getDoc(doc(db(), "users", userId, "settings", "preferences"));
  return snap.exists() ? (snap.data() as UserSettings) : null;
}

export async function saveSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
  await setDoc(doc(db(), "users", userId, "settings", "preferences"), settings, { merge: true });
}

// Feeds
export function subscribeToFeeds(userId: string, callback: (feeds: Feed[]) => void): Unsubscribe {
  const q = query(collection(db(), "users", userId, "feeds"));
  return onSnapshot(q, (snap) => {
    const feeds = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Feed));
    callback(feeds);
  });
}

export async function addFeed(userId: string, feed: Omit<Feed, "id">): Promise<string> {
  const ref = await addDoc(collection(db(), "users", userId, "feeds"), {
    ...feed,
    lastFetched: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteFeed(userId: string, feedId: string): Promise<void> {
  await deleteDoc(doc(db(), "users", userId, "feeds", feedId));
}

export async function updateFeed(userId: string, feedId: string, data: Partial<Feed>): Promise<void> {
  await updateDoc(doc(db(), "users", userId, "feeds", feedId), data);
}

// Folders
export function subscribeToFolders(userId: string, callback: (folders: Folder[]) => void): Unsubscribe {
  const q = query(collection(db(), "users", userId, "folders"), orderBy("order"));
  return onSnapshot(q, (snap) => {
    const folders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Folder));
    callback(folders);
  });
}

export async function addFolder(userId: string, name: string, order: number): Promise<string> {
  const ref = await addDoc(collection(db(), "users", userId, "folders"), { name, order });
  return ref.id;
}

export async function deleteFolder(userId: string, folderId: string): Promise<void> {
  await deleteDoc(doc(db(), "users", userId, "folders", folderId));
}

export async function updateFolder(userId: string, folderId: string, data: Partial<Folder>): Promise<void> {
  await updateDoc(doc(db(), "users", userId, "folders", folderId), data);
}

// Articles
export function subscribeToArticles(
  userId: string,
  feedId: string | null,
  callback: (articles: Article[]) => void
): Unsubscribe {
  const col = collection(db(), "users", userId, "articles");
  const q = feedId
    ? query(col, where("feedId", "==", feedId))
    : query(col, orderBy("publishedAt", "desc"));

  return onSnapshot(
    q,
    (snap) => {
      const articles = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
      callback(articles);
    },
    (error) => console.error("subscribeToArticles error:", error)
  );
}

export async function saveArticles(userId: string, articles: Omit<Article, "id">[]): Promise<void> {
  await Promise.all(
    articles.map((article) =>
      setDoc(doc(db(), "users", userId, "articles", btoa(article.url)), article, { merge: true })
    )
  );
}

export async function markAsRead(userId: string, articleId: string, isRead: boolean): Promise<void> {
  await updateDoc(doc(db(), "users", userId, "articles", articleId), { isRead });
}

export async function toggleBookmark(userId: string, articleId: string, isBookmarked: boolean): Promise<void> {
  await updateDoc(doc(db(), "users", userId, "articles", articleId), { isBookmarked });
}

export async function updateArticle(userId: string, articleId: string, data: Partial<Article>): Promise<void> {
  await updateDoc(doc(db(), "users", userId, "articles", articleId), data);
}

// Keywords
export async function getKeywords(userId: string): Promise<Keyword[]> {
  const snap = await getDocs(collection(db(), "users", userId, "keywords"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Keyword));
}

export async function addKeyword(userId: string, word: string): Promise<string> {
  const ref = await addDoc(collection(db(), "users", userId, "keywords"), { word, active: true });
  return ref.id;
}

export async function deleteKeyword(userId: string, keywordId: string): Promise<void> {
  await deleteDoc(doc(db(), "users", userId, "keywords", keywordId));
}
