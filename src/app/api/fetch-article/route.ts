import { NextRequest, NextResponse } from "next/server";
import { extractArticle } from "@/lib/readability";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Brak parametru url" }, { status: 400 });
  }

  try {
    const article = await extractArticle(url);
    return NextResponse.json(article);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Nieznany błąd";
    return NextResponse.json({ error: `Nie udało się pobrać artykułu: ${message}` }, { status: 500 });
  }
}
