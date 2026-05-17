export function isSafeUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();

  if (hostname === "localhost") return false;

  // IPv6 loopback, private ranges, and IPv4-mapped addresses (::ffff:x.x.x.x)
  // The WHATWG URL parser normalises all forms (e.g. [0:0:0:0:0:ffff:7f00:1],
  // [::ffff:127.0.0.1]) to the [::ffff:…] compressed representation, so a
  // single startsWith check covers every variant.  Without this, an attacker
  // can bypass the IPv4 block list by encoding 127.0.0.1 as [::ffff:7f00:1] —
  // Node.js net/undici routes it to 127.0.0.1 and returns ECONNREFUSED, not
  // ENETUNREACH, proving the connection reaches loopback.
  if (
    hostname === "[::1]" ||
    hostname === "::1" ||
    hostname.startsWith("[::ffff:") ||
    hostname.startsWith("[fc") ||
    hostname.startsWith("[fd") ||
    hostname.startsWith("[fe80")
  ) {
    return false;
  }

  // IPv4 private and reserved ranges
  const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (
      a === 0 ||
      a === 127 ||
      a === 255 ||
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254)
    ) {
      return false;
    }
  }

  return true;
}

const MAX_REDIRECTS = 5;

/**
 * Fetch wrapper that manually follows redirects, re-validating each
 * Location header through isSafeUrl() to prevent SSRF via open redirects.
 */
export async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let currentUrl = url;

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const res = await fetch(currentUrl, { ...options, redirect: "manual" });

    if (res.status < 300 || res.status >= 400) return res;

    const location = res.headers.get("location");
    if (!location) throw new Error("Redirect bez nagłówka Location");

    const resolved = new URL(location, currentUrl).href;
    if (!isSafeUrl(resolved)) throw new Error("Niedozwolone przekierowanie");

    currentUrl = resolved;
  }

  throw new Error("Zbyt wiele przekierowań");
}
