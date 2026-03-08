// app/api/auth/me/route.ts
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import type { TokenPayload } from '@/lib/api-auth';

export async function GET() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return Response.json({ loggedIn: false });

  try {
    const user = verifyToken(token) as TokenPayload;
    return Response.json({ loggedIn: true, user });
  } catch (e) {
    console.error('JWT verification failed:', e);
    return Response.json({ loggedIn: false });
  }
}
