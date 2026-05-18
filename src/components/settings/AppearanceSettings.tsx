"use client";

import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import type { Theme } from "@/types";

interface Props {
  userId: string;
}

const ALL_THEME_CLASSES = ["light", "dark", "sepia", "neon", "nord", "paper", "terminal"] as const;

const THEMES: { value: Theme; label: string; colors: { bg: string; accent: string; swatchBorder?: string } }[] = [
  { value: "light",    label: "Jasny",    colors: { bg: "#FAFAF8", accent: "#007AFF", swatchBorder: "rgba(0,0,0,0.10)" } },
  { value: "dark",     label: "Ciemny",   colors: { bg: "#000000", accent: "#007AFF" } },
  { value: "sepia",    label: "Sepia",    colors: { bg: "#F5EDD6", accent: "#8B5E3C", swatchBorder: "rgba(0,0,0,0.10)" } },
  { value: "neon",     label: "Neon",     colors: { bg: "#0A0A0F", accent: "#FF2D78" } },
  { value: "nord",     label: "Nord",     colors: { bg: "#2E3440", accent: "#88C0D0" } },
  { value: "paper",    label: "Paper",    colors: { bg: "#FAF8F4", accent: "#C17D2C", swatchBorder: "rgba(0,0,0,0.10)" } },
  { value: "terminal", label: "Terminal", colors: { bg: "#000000", accent: "#00FF41" } },
];

export default function AppearanceSettings({ userId }: Props) {
  const { settings, updateSettings } = useSettings(userId);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...ALL_THEME_CLASSES);
    root.classList.add(settings.theme);
    document.documentElement.style.setProperty("--font-size", `${settings.fontSize}px`);
  }, [settings.theme, settings.fontSize]);

  return (
    <SettingsSection title="Wygląd">
      {/* Motyw — siatka kart z podglądem kolorów */}
      <div style={{ padding: "16px", borderBottom: "1px solid var(--color-separator)" }}>
        <p className="text-subheadline" style={{ color: "var(--color-label)", fontWeight: 500, marginBottom: 12 }}>
          Motyw
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {THEMES.map(({ value, label, colors }) => {
            const active = settings.theme === value;
            return (
              <button
                key={value}
                onClick={() => updateSettings({ theme: value })}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px",
                  borderRadius: "var(--radius-md)",
                  border: `2px solid ${active ? "var(--color-accent)" : "var(--color-separator)"}`,
                  background: "transparent",
                  cursor: "pointer",
                  position: "relative",
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 36,
                    borderRadius: "var(--radius-sm)",
                    background: colors.bg,
                    border: colors.swatchBorder ? `1px solid ${colors.swatchBorder}` : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "var(--radius-full)",
                      background: colors.accent,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--color-accent)" : "var(--color-label-secondary)",
                    lineHeight: 1,
                  }}
                >
                  {label}
                </span>
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 16,
                      height: 16,
                      borderRadius: "var(--radius-full)",
                      background: "var(--color-accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

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
