import type { AIRequest, AIProvider } from "@/types";

const PROMPTS = {
  summarize: (content: string) =>
    `Streść poniższy artykuł w 3-5 zdaniach po polsku. Skup się na najważniejszych informacjach.\n\nArtykuł: ${content}`,
  translate: (content: string) =>
    `Przetłumacz poniższy artykuł na język polski. Zachowaj oryginalną strukturę i formatowanie.\n\nArtykuł: ${content}`,
  autotag: (content: string) =>
    `Zaproponuj 3-5 krótkich tagów (po polsku) dla poniższego artykułu. Zwróć tylko tagi oddzielone przecinkami, bez dodatkowego tekstu.\n\nArtykuł: ${content}`,
  sentiment: (content: string) =>
    `Oceń sentyment poniższego artykułu. Odpowiedz jednym słowem: "positive", "neutral" lub "negative".\n\nArtykuł: ${content}`,
};

async function callClaude(prompt: string, apiKey: string, model: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

async function callOpenAI(prompt: string, apiKey: string, model: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGemini(prompt: string, apiKey: string, model: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

const callers: Record<AIProvider, (prompt: string, apiKey: string, model: string) => Promise<string>> = {
  claude: callClaude,
  openai: callOpenAI,
  gemini: callGemini,
};

export async function runAI(request: AIRequest): Promise<string> {
  const { action, content, provider, apiKey, model, chatHistory } = request;

  let prompt: string;
  if (action === "chat") {
    const history = chatHistory?.map((m) => `${m.role === "user" ? "Użytkownik" : "AI"}: ${m.content}`).join("\n") ?? "";
    prompt = `${history}\nUżytkownik: ${content}\n\nKontekst artykułu: ${content}`;
  } else {
    prompt = PROMPTS[action](content);
  }

  return callers[provider](prompt, apiKey, model);
}
