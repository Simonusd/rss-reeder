"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import ArticleList from "@/components/layout/ArticleList";
import ArticleView from "@/components/layout/ArticleView";

function ReaderContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && !user) {
      document.cookie = "session=; path=/; max-age=0";
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Ładowanie...</div>;
  }

  const feedId = searchParams.get("feedId");
  const filter = searchParams.get("filter");
  const articleId = searchParams.get("articleId");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userId={user.uid} />
      <ArticleList userId={user.uid} feedId={feedId} filter={filter} articleId={articleId} />
      <ArticleView userId={user.uid} articleId={articleId} />
    </div>
  );
}

export default function ReaderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Ładowanie...</div>}>
      <ReaderContent />
    </Suspense>
  );
}
