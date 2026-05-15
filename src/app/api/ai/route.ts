import { NextRequest, NextResponse } from "next/server";
import { runAI } from "@/lib/ai";
import type { AIRequest } from "@/types";

export async function POST(req: NextRequest) {
  let body: AIRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane JSON" }, { status: 400 });
  }

  const { action, content, provider, apiKey, model } = body;

  if (!action || !content || !provider || !apiKey || !model) {
    return NextResponse.json({ error: "Brakujące pola: action, content, provider, apiKey, model" }, { status: 400 });
  }

  try {
    const result = await runAI(body);
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Nieznany błąd";
    return NextResponse.json({ error: `Błąd AI: ${message}` }, { status: 500 });
  }
}
