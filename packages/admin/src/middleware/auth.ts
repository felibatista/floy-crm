import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export async function handleAuthCheck(
  request: NextRequest
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const statusRes = await fetch(`${apiUrl}/api/admin/auth/status`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

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
        return null;
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
    console.error("Middleware auth check failed:", error);
  }

  return null;
}
