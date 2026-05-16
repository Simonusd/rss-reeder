"use client";

import { useSettings } from "@/hooks/useSettings";
import { SettingsSection, SettingsRow } from "./AppearanceSettings";

interface Props {
  userId: string;
}

export default function FeedSettings({ userId }: Props) {
  const { settings, updateSettings } = useSettings(userId);

  return (
    <SettingsSection title="Feedy">
      <SettingsRow label={`Odświeżanie co ${settings.refreshInterval} min`} last>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 200 }}>
          <span className="text-caption" style={{ color: "var(--color-label-secondary)", width: 28 }}>
            {settings.refreshInterval}
          </span>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={settings.refreshInterval}
            onChange={(e) => updateSettings({ refreshInterval: Number(e.target.value) })}
            style={{ flex: 1, accentColor: "var(--color-accent)" }}
          />
        </div>
      </SettingsRow>
    </SettingsSection>
  );
}
