import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      return NextResponse.next();
    }

    const statusRes = await fetch(`${apiUrl}/api/admin/auth/status`);

    if (statusRes.ok) {
      const statusData = await statusRes.json();
      const isInitialized = statusData.isInitialized;

      const isSetupPage = pathname === "/setup";
      const isLoginPage = pathname === "/login";
      const token = request.cookies.get("token")?.value;

      // Case A: System NOT initialized -> Force redirect to /setup
      if (!isInitialized) {
        if (!isSetupPage) {
          return NextResponse.redirect(new URL("/setup", request.url));
        }
        return NextResponse.next();
      }

      // Case B: System IS initialized

      // 1. Block access to /setup
      if (isSetupPage) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // 2. Check Authentication
      if (!token) {
        // If not logged in and not on login page, redirect to login
        if (!isLoginPage) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      } else {
        // If logged in and on login page, redirect to dashboard
        if (isLoginPage) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
    }
  } catch (error) {
    console.error("Middleware backend check failed:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
