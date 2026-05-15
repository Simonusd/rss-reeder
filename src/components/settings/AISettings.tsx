"use client";

import { useSettings } from "@/hooks/useSettings";
import type { AIProvider } from "@/types";

const MODELS: Record<AIProvider, string[]> = {
  claude: ["claude-sonnet-4-6", "claude-haiku-4-5-20251001", "claude-opus-4-7"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  gemini: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash"],
};

interface Props {
  userId: string;
}

export default function AISettings({ userId }: Props) {
  const { settings, updateSettings } = useSettings(userId);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Integracja AI</h2>
      <p className="text-sm text-gray-500">Wklej własny klucz API (BYOK). Klucz jest przechowywany w Twojej bazie Firestore.</p>

      <div>
        <label className="block text-sm font-medium mb-1">Dostawca AI</label>
        <select
          value={settings.aiProvider}
          onChange={(e) => updateSettings({ aiProvider: e.target.value as AIProvider, aiModel: MODELS[e.target.value as AIProvider][0] })}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="claude">Claude (Anthropic)</option>
          <option value="openai">ChatGPT (OpenAI)</option>
          <option value="gemini">Gemini (Google)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Model</label>
        <select
          value={settings.aiModel}
          onChange={(e) => updateSettings({ aiModel: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        >
          {MODELS[settings.aiProvider].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Klucz API</label>
        <input
          type="password"
          value={settings.aiApiKey}
          onChange={(e) => updateSettings({ aiApiKey: e.target.value })}
          placeholder="sk-..."
          className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="autoSummarize"
          checked={settings.autoSummarize}
          onChange={(e) => updateSettings({ autoSummarize: e.target.checked })}
        />
        <label htmlFor="autoSummarize" className="text-sm">Auto-streszczenie po otwarciu artykułu</label>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="autoTranslate"
          checked={settings.autoTranslate}
          onChange={(e) => updateSettings({ autoTranslate: e.target.checked })}
        />
        <label htmlFor="autoTranslate" className="text-sm">Auto-tłumaczenie na polski (jeśli artykuł nie jest po polsku)</label>
      </div>
    </section>
  );
}
