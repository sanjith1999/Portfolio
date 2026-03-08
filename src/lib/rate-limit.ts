type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  keyPrefix: string;
  windowMs: number;
  limit: number;
};

const globalStore = globalThis as typeof globalThis & {
  __portfolioRateLimitStore?: Map<string, RateLimitEntry>;
};

const store = globalStore.__portfolioRateLimitStore ?? new Map<string, RateLimitEntry>();
globalStore.__portfolioRateLimitStore = store;

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return req.headers.get('x-real-ip') ?? 'unknown';
}

export function checkRateLimit(req: Request, options: RateLimitOptions): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const key = `${options.keyPrefix}:${getClientIp(req)}`;
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true };
  }

  if (existing.count >= options.limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  store.set(key, existing);
  return { ok: true };
}
