import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleSubdomainRedirect } from "./middleware/subdomain";
import { handleAuthCheck } from "./middleware/auth";
import { isStaticAsset } from "./middleware/static";

export async function middleware(request: NextRequest) {
  const subdomainResponse = handleSubdomainRedirect(request);
  if (subdomainResponse) {
    return subdomainResponse;
  }
  if (isStaticAsset(request)) {
    return NextResponse.next();
  }

  const authResponse = await handleAuthCheck(request);
  if (authResponse) {
    return authResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
