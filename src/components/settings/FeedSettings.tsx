"use client";

import { useSettings } from "@/hooks/useSettings";

interface Props {
  userId: string;
}

export default function FeedSettings({ userId }: Props) {
  const { settings, updateSettings } = useSettings(userId);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Feedy</h2>

      <div>
        <label className="block text-sm font-medium mb-1">
          Odświeżanie co: {settings.refreshInterval} minut
        </label>
        <input
          type="range"
          min={5}
          max={120}
          step={5}
          value={settings.refreshInterval}
          onChange={(e) => updateSettings({ refreshInterval: Number(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>5 min</span>
          <span>2 godz.</span>
        </div>
      </div>
    </section>
  );
}
