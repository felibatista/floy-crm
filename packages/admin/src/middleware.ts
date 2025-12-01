import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // In local dev: localhost:3000 is admin
  // In prod: admin.domain.com or domain.com is admin
  
  // If we are on localhost
  if (hostname.includes('localhost')) {
    // If it's NOT localhost:3000 (e.g. it's a subdomain like tenant.localhost:3000)
    // We want to redirect to the PORTAL port (3002)
    
    // Check if it has a subdomain that is NOT 'www' or 'admin'
    const parts = hostname.split('.');
    const isSubdomain = parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'admin';

    if (isSubdomain) {
      // Redirect to the Portal App running on port 3002
      // We construct the new URL manually using the host header to ensure we keep the subdomain
      const protocol = request.nextUrl.protocol;
      const pathname = request.nextUrl.pathname;
      const search = request.nextUrl.search;
      
      // Replace port 3000 with 3002 in the host string
      // If host is "prueba.localhost:3000", it becomes "prueba.localhost:3002"
      const newHost = hostname.replace(':3000', ':3002');
      
      return NextResponse.redirect(new URL(`${protocol}//${newHost}${pathname}${search}`));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
