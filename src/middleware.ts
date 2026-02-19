import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // We can't access localStorage in middleware (server-side).
  // Ideally, authentication token should be in a cookie for middleware to verify.
  // But since we are using localStorage/Zustand persist, middleware can't check auth state directly easily without cookies.

  // Strategy:
  // 1. If using cookies: Check for auth token in cookies.
  // 2. If using only localStorage: Middleware passes requests, and client components/layouts handle redirection (RoleGuard).

  // For this implementation, I will assume we might migrate to cookies later, or rely on client-side protection.
  // However, `RoleGuard.tsx` was mentioned in the file structure. That suggests Component-level protection.

  // But standard Next.js auth usually involves cookies.
  // Since the user asked to "Login in frontend" based on "backend login" which returns a transparent token (likely JWT),
  // and we are storing in Zustand (localStorage), we are doing Client-Side Auth.

  // Therefore, middleware is limited.
  // But we can redirect root to login or dashboard.

  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
