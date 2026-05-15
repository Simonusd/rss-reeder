import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Brak parametru url" }, { status: 400 });
  }

  let targetUrl: string;
  try {
    targetUrl = new URL(url).href;
  } catch {
    return NextResponse.json({ error: "Nieprawidłowy URL" }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pl,en;q=0.9",
      },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") ?? "text/html";

    if (contentType.includes("text/html")) {
      let html = await response.text();

      // Inject <base> so relative URLs resolve correctly
      const baseTag = `<base href="${targetUrl}">`;
      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/<head[^>]*>/i, (m) => `${m}${baseTag}`);
      } else {
        html = baseTag + html;
      }

      return new NextResponse(html, {
        status: response.status,
        headers: {
          "Content-Type": contentType,
          // X-Frame-Options and CSP frame-ancestors intentionally omitted
        },
      });
    }

    // Non-HTML resources: proxy as-is, strip frame-blocking headers
    const body = await response.arrayBuffer();
    const headers = new Headers();
    response.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k !== "x-frame-options" && k !== "content-security-policy") {
        headers.set(key, value);
      }
    });
    return new NextResponse(body, { status: response.status, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Nieznany błąd";
    return NextResponse.json(
      { error: `Nie udało się pobrać strony: ${message}` },
      { status: 500 }
    );
  }
}
