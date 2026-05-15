"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import ArticleList from "@/components/layout/ArticleList";
import ArticleView from "@/components/layout/ArticleView";

export default function ReaderPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Ładowanie...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userId={user.uid} />
      <ArticleList userId={user.uid} />
      <ArticleView userId={user.uid} />
    </div>
  );
}
