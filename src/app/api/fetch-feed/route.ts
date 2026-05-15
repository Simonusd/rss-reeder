import { NextRequest, NextResponse } from "next/server";
import { parseFeed } from "@/lib/rss";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Brak parametru url" }, { status: 400 });
  }

  try {
    const result = await parseFeed(url);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Nieznany błąd";
    return NextResponse.json({ error: `Nie udało się pobrać feedu: ${message}` }, { status: 500 });
  }
}
