"use client";

import { useSettings } from "@/hooks/useSettings";
import type { Theme } from "@/types";

interface Props {
  userId: string;
}

export default function AppearanceSettings({ userId }: Props) {
  const { settings, updateSettings } = useSettings(userId);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Wygląd</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Motyw</label>
        <div className="flex gap-3">
          {(["light", "dark", "sepia"] as Theme[]).map((theme) => (
            <button
              key={theme}
              onClick={() => updateSettings({ theme })}
              className={`px-4 py-2 border rounded-lg text-sm capitalize ${
                settings.theme === theme ? "border-blue-600 bg-blue-50 text-blue-700" : "hover:bg-gray-50"
              }`}
            >
              {theme === "light" ? "Jasny" : theme === "dark" ? "Ciemny" : "Sepia"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Rozmiar czcionki: {settings.fontSize}px
        </label>
        <input
          type="range"
          min={12}
          max={24}
          value={settings.fontSize}
          onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Krój pisma</label>
        <div className="flex gap-3">
          <button
            onClick={() => updateSettings({ fontFamily: "sans-serif" })}
            className={`px-4 py-2 border rounded-lg text-sm font-sans ${
              settings.fontFamily === "sans-serif" ? "border-blue-600 bg-blue-50 text-blue-700" : "hover:bg-gray-50"
            }`}
          >
            Bezszeryfowy
          </button>
          <button
            onClick={() => updateSettings({ fontFamily: "serif" })}
            className={`px-4 py-2 border rounded-lg text-sm font-serif ${
              settings.fontFamily === "serif" ? "border-blue-600 bg-blue-50 text-blue-700" : "hover:bg-gray-50"
            }`}
          >
            Szeryfowy
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="readerMode"
          checked={settings.readerMode}
          onChange={(e) => updateSettings({ readerMode: e.target.checked })}
        />
        <label htmlFor="readerMode" className="text-sm">Domyślnie tryb czytania (bez reklam)</label>
      </div>
    </section>
  );
}
