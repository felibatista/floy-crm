import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function handleSubdomainRedirect(
  request: NextRequest
): NextResponse | null {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  if (hostname.includes("localhost")) {
    const parts = hostname.split(".");
    const isSubdomain =
      parts.length > 1 && parts[0] !== "www" && parts[0] !== "admin";

    if (isSubdomain) {
      const protocol = request.nextUrl.protocol;
      const search = request.nextUrl.search;
      const newHost = hostname.replace(":3000", ":3002");

      return NextResponse.redirect(
        new URL(`${protocol}//${newHost}${pathname}${search}`)
      );
    }
  }

  return null;
}
