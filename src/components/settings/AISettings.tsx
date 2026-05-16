"use client";

import { useSettings } from "@/hooks/useSettings";
import type { AIProvider } from "@/types";
import { SettingsSection, SettingsRow, Toggle } from "./AppearanceSettings";

const MODELS: Record<AIProvider, string[]> = {
  claude: ["claude-sonnet-4-6", "claude-haiku-4-5-20251001", "claude-opus-4-7"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  gemini: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash"],
};

const PROVIDERS = [
  { value: "claude" as AIProvider, label: "Claude (Anthropic)" },
  { value: "openai" as AIProvider, label: "ChatGPT (OpenAI)" },
  { value: "gemini" as AIProvider, label: "Gemini (Google)" },
];

interface Props {
  userId: string;
}

export default function AISettings({ userId }: Props) {
  const { settings, updateSettings } = useSettings(userId);

  return (
    <SettingsSection title="Integracja AI">
      <SettingsRow label="Dostawca AI">
        <select
          value={settings.aiProvider}
          onChange={(e) =>
            updateSettings({
              aiProvider: e.target.value as AIProvider,
              aiModel: MODELS[e.target.value as AIProvider][0],
            })
          }
          style={{
            background: "var(--color-bg-secondary)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "6px 10px",
            fontSize: 14,
            color: "var(--color-label)",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {PROVIDERS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </SettingsRow>

      <SettingsRow label="Model">
        <select
          value={settings.aiModel}
          onChange={(e) => updateSettings({ aiModel: e.target.value })}
          style={{
            background: "var(--color-bg-secondary)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "6px 10px",
            fontSize: 14,
            color: "var(--color-label)",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {MODELS[settings.aiProvider].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </SettingsRow>

      <SettingsRow label="Klucz API">
        <input
          type="password"
          value={settings.aiApiKey}
          onChange={(e) => updateSettings({ aiApiKey: e.target.value })}
          placeholder="sk-..."
          style={{
            background: "var(--color-bg-secondary)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "6px 12px",
            fontSize: 13,
            fontFamily: "monospace",
            color: "var(--color-label)",
            width: 200,
            outline: "none",
          }}
        />
      </SettingsRow>

      <SettingsRow label="Auto-streszczenie przy otwarciu">
        <Toggle
          checked={settings.autoSummarize}
          onChange={(v) => updateSettings({ autoSummarize: v })}
        />
      </SettingsRow>

      <SettingsRow label="Auto-tłumaczenie na polski" last>
        <Toggle
          checked={settings.autoTranslate}
          onChange={(v) => updateSettings({ autoTranslate: v })}
        />
      </SettingsRow>
    </SettingsSection>
  );
}
