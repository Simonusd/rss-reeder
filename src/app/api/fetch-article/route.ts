import { NextRequest, NextResponse } from "next/server";
import { extractArticle } from "@/lib/readability";
import { isSafeUrl } from "@/lib/validate-url";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Brak parametru url" }, { status: 400 });
  }

  if (!isSafeUrl(url)) {
    return NextResponse.json({ error: "Nieprawidłowy lub niedozwolony URL" }, { status: 400 });
  }

  try {
    const article = await extractArticle(url);
    return NextResponse.json(article);
  } catch {
    return NextResponse.json({ error: "Nie udało się pobrać artykułu" }, { status: 500 });
  }
}
