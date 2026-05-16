"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
    return (
      <div
        style={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--color-bg-secondary)",
        }}
      >
        <div className="skeleton" style={{ width: 120, height: 20, borderRadius: 10 }} />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-secondary)",
        color: "var(--color-label)",
      }}
    >
      {/* Toolbar */}
      <div
        className="toolbar"
        style={{
          maxWidth: 720,
          margin: "0 auto",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "var(--color-material-thick)",
        }}
      >
        <Link
          href="/reader"
          style={{
            display: "flex", alignItems: "center", gap: 4,
            color: "var(--color-accent)", textDecoration: "none", fontSize: 17,
          }}
        >
          <ChevronLeft size={20} />
          Wstecz
        </Link>
        <h1 className="text-headline" style={{ color: "var(--color-label)" }}>
          Ustawienia
        </h1>
        <div style={{ width: 80 }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 80px" }}>
        <AppearanceSettings userId={user.uid} />
        <div style={{ height: 32 }} />
        <AISettings userId={user.uid} />
        <div style={{ height: 32 }} />
        <FeedSettings userId={user.uid} />
      </div>
    </div>
  );
}
