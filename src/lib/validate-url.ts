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
