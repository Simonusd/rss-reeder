import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/reader", "/settings", "/article"];
const AUTH_ONLY = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session");

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthOnly && session) {
    return NextResponse.redirect(new URL("/reader", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/reader/:path*", "/settings/:path*", "/article/:path*", "/login", "/register"],
};
