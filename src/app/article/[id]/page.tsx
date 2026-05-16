"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ReaderMode from "@/components/articles/ReaderMode";
import AIToolbar from "@/components/ai/AIToolbar";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Article } from "@/types";

export default function ArticlePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [fetchedContent, setFetchedContent] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !params.id) return;
    getDoc(doc(db(), "users", user.uid, "articles", params.id)).then((snap) => {
      if (snap.exists()) setArticle({ id: snap.id, ...snap.data() } as Article);
    });
  }, [user, params.id]);

  if (loading || !user || !article) {
    return <div className="min-h-screen flex items-center justify-center">Ładowanie...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <AIToolbar article={article} userId={user.uid} onContentFetched={setFetchedContent} />
      <ReaderMode article={article} contentOverride={fetchedContent} />
    </div>
  );
}
