import { verifyToken } from '@/lib/auth';
import type { TokenPayload } from '@/lib/api-auth';

export function isAdminToken(token: string): boolean {
  const decoded = verifyToken(token) as TokenPayload;
  return decoded.role === 'admin';
}
