import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function verifyToken(token: string, apiUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/api/admin/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

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

    const isLoginPage = pathname === "/login";
    const token = request.cookies.get("admin_token")?.value;

    // No token - redirect to login (except if already on login)
    if (!token) {
      if (!isLoginPage) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return null;
    }

    // Has token - verify it's valid
    const isValid = await verifyToken(token, apiUrl);

    if (!isValid) {
      // Invalid token - clear cookie and redirect to login
      if (!isLoginPage) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("admin_token");
        return response;
      }
      return null;
    }

    // Valid token - redirect away from login page
    if (isLoginPage || pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch (error) {
    console.error("Middleware auth check failed:", error);
  }

  return null;
}
