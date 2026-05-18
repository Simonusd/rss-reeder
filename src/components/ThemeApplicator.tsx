"use client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

export function ThemeApplicator() {
  const { user } = useAuth();
  const { settings } = useSettings(user?.uid ?? null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "sepia", "light");
    if (settings.theme === "dark") root.classList.add("dark");
    else if (settings.theme === "sepia") root.classList.add("sepia");
    else if (settings.theme === "light") root.classList.add("light");
    root.style.setProperty("--font-size", `${settings.fontSize}px`);
    try { localStorage.setItem("rss-theme", settings.theme); } catch { /* private browsing */ }
  }, [settings.theme, settings.fontSize]);

  return null;
}
