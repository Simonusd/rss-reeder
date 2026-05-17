import { NextRequest, NextResponse } from "next/server";
import { runAI } from "@/lib/ai";
import type { AIRequest, AIAction, AIProvider } from "@/types";

const VALID_ACTIONS: AIAction[] = ["summarize", "translate", "autotag", "sentiment", "chat"];
const VALID_PROVIDERS: AIProvider[] = ["claude", "openai", "gemini"];
const MAX_CONTENT_LENGTH = 50_000;

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

  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Nieznana akcja AI" }, { status: 400 });
  }

  if (!VALID_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "Nieznany dostawca AI" }, { status: 400 });
  }

  if (typeof content !== "string" || content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: "Treść jest zbyt długa" }, { status: 400 });
  }

  try {
    const result = await runAI(body);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: "Błąd podczas przetwarzania AI" }, { status: 500 });
  }
}
