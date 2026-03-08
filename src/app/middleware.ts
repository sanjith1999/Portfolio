import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAdminToken } from '@/lib/authz';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Protect all admin routes
  if (path.startsWith('/admin')) {
    const token = req.cookies.get('token')?.value;

    // No token → unauthorized
    if (!token) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    try {
      if (!isAdminToken(token)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    } catch (err) {
      console.error('JWT verification error:', err);
      // Invalid or expired token
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
