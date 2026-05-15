"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
      <h1 className="text-2xl font-bold">Ustawienia</h1>
      <AppearanceSettings userId={user.uid} />
      <AISettings userId={user.uid} />
      <FeedSettings userId={user.uid} />
    </div>
  );
}
