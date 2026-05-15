"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import AISettings from "@/components/settings/AISettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import FeedSettings from "@/components/settings/FeedSettings";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      document.cookie = "session=; path=/; max-age=0";
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Ładowanie...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <Link
        href="/reader"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Powrót
      </Link>
      <h1 className="text-2xl font-bold">Ustawienia</h1>
      <AppearanceSettings userId={user.uid} />
      <AISettings userId={user.uid} />
      <FeedSettings userId={user.uid} />
    </div>
  );
}
