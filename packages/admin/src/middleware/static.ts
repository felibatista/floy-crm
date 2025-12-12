import type { NextRequest } from "next/server";

export function isStaticAsset(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;

  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  );
}
