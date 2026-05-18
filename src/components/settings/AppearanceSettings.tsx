"use client";

import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import type { Theme } from "@/types";

interface Props {
  userId: string;
}

const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "Jasny" },
  { value: "dark",  label: "Ciemny" },
  { value: "sepia", label: "Sepia" },
];

export default function AppearanceSettings({ userId }: Props) {
  const { settings, updateSettings } = useSettings(userId);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "sepia", "light");
    if (settings.theme === "dark") root.classList.add("dark");
    else if (settings.theme === "sepia") root.classList.add("sepia");
    else if (settings.theme === "light") root.classList.add("light");
    document.documentElement.style.setProperty("--font-size", `${settings.fontSize}px`);
  }, [settings.theme, settings.fontSize]);

  return (
    <SettingsSection title="Wygląd">
      {/* Motyw */}
      <SettingsRow label="Motyw" noBorder>
        <div style={{ display: "flex", gap: 8 }}>
          {THEMES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateSettings({ theme: value })}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                fontSize: 14,
                fontWeight: settings.theme === value ? 600 : 400,
                color: settings.theme === value ? "white" : "var(--color-label)",
                background: settings.theme === value ? "var(--color-accent)" : "var(--color-bg-secondary)",
                border: "none",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </SettingsRow>

      <SettingsRow label="Rozmiar czcionki">
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
          <span className="text-caption" style={{ color: "var(--color-label-secondary)", width: 28 }}>
            {settings.fontSize}px
          </span>
          <input
            type="range"
            min={15}
            max={30}
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
            style={{ flex: 1, accentColor: "var(--color-accent)" }}
          />
        </div>
      </SettingsRow>

      <SettingsRow label="Krój pisma">
        <div style={{ display: "flex", gap: 8 }}>
          {(["sans-serif", "serif"] as const).map((f) => (
            <button
              key={f}
              onClick={() => updateSettings({ fontFamily: f })}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                fontSize: 14,
                fontWeight: settings.fontFamily === f ? 600 : 400,
                color: settings.fontFamily === f ? "white" : "var(--color-label)",
                background: settings.fontFamily === f ? "var(--color-accent)" : "var(--color-bg-secondary)",
                fontFamily: f,
                border: "none",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              {f === "sans-serif" ? "Bezszeryfowy" : "Szeryfowy"}
            </button>
          ))}
        </div>
      </SettingsRow>

      <SettingsRow label="Tryb czytania domyślnie" last>
        <Toggle
          checked={settings.readerMode}
          onChange={(v) => updateSettings({ readerMode: v })}
        />
      </SettingsRow>
    </SettingsSection>
  );
}

// ── Shared components ────────────────────────────────────────────

export function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-caption uppercase tracking-wide px-1 mb-2"
        style={{ color: "var(--color-label-secondary)", fontWeight: 500 }}
      >
        {title}
      </p>
      <div
        style={{
          background: "var(--color-bg-primary)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--color-separator)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function SettingsRow({
  label, children, last = false, noBorder = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
  noBorder?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        gap: 16,
        borderBottom: last || noBorder ? "none" : "1px solid var(--color-separator)",
      }}
    >
      <span className="text-body" style={{ color: "var(--color-label)" }}>{label}</span>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 51, height: 31,
        borderRadius: "var(--radius-full)",
        background: checked ? "var(--color-accent-green)" : "var(--color-bg-secondary)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.25s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          width: 27, height: 27,
          borderRadius: "var(--radius-full)",
          background: "white",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          transition: "left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
    </button>
  );
}
