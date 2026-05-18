import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeApplicator } from "@/components/ThemeApplicator";

export const metadata: Metadata = {
  title: "RSS Reader",
  description: "Czytaj wiadomości bez reklam",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RSS Reader",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

const themeScript = `
  try {
    var t = localStorage.getItem('rss-theme');
    if (['light','dark','sepia','neon','nord','paper','terminal'].includes(t)) {
      document.documentElement.classList.add(t);
    }
  } catch(e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body style={{ background: "var(--color-bg-primary)", color: "var(--color-label)" }}>
        <ThemeApplicator />
        {children}
      </body>
    </html>
  );
}
