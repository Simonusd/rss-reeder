"use client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

export function ThemeApplicator() {
  const { user } = useAuth();
  const { settings } = useSettings(user?.uid ?? null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "sepia", "neon", "nord", "paper", "terminal");
    root.classList.add(settings.theme);
    root.style.setProperty("--font-size", `${settings.fontSize}px`);
    try { localStorage.setItem("rss-theme", settings.theme); } catch { /* private browsing */ }
  }, [settings.theme, settings.fontSize]);

  return null;
}
