import { NextResponse } from 'next/server';

import { verifyToken } from '@/lib/auth';

export type TokenPayload = {
  id: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
};

function getTokenFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function getAuthFromRequest(req: Request): TokenPayload | null {
  const token = getTokenFromCookieHeader(req.headers.get('cookie'));
  if (!token) return null;

  try {
    return verifyToken(token) as TokenPayload;
  } catch {
    return null;
  }
}

export function requireAdmin(req: Request): NextResponse | null {
  const auth = getAuthFromRequest(req);
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
