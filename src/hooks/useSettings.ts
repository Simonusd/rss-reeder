"use client";

import { useState, useEffect } from "react";
import { getSettings, saveSettings } from "@/lib/firestore";
import type { UserSettings } from "@/types";

const DEFAULT_SETTINGS: UserSettings = {
  readerMode: true,
  theme: "light",
  fontSize: 16,
  fontFamily: "sans-serif",
  refreshInterval: 30,
  autoTranslate: false,
  autoSummarize: false,
  aiProvider: "claude",
  aiModel: "claude-sonnet-4-6",
  aiApiKey: "",
};

export function useSettings(userId: string | null) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    getSettings(userId).then((s) => {
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...s });
      setLoading(false);
    });
  }, [userId]);

  async function updateSettings(partial: Partial<UserSettings>) {
    if (!userId) return;
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await saveSettings(userId, partial);
  }

  return { settings, loading, updateSettings };
}
