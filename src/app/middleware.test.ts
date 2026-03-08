import assert from 'node:assert/strict';
import test from 'node:test';

import { NextRequest } from 'next/server';

import { signToken } from '@/lib/auth';
import { middleware } from '@/app/middleware';

process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';

test('middleware redirects /admin when token is missing', () => {
  const req = new NextRequest('http://localhost/admin/projects');
  const res = middleware(req);

  assert.equal(res.status, 307);
  assert.match(res.headers.get('location') ?? '', /\/unauthorized$/);
});

test('middleware redirects /admin when token is non-admin', () => {
  const token = signToken({ id: 'user-1', role: 'user' });
  const req = new NextRequest('http://localhost/admin/projects', {
    headers: { cookie: `token=${token}` },
  });

  const res = middleware(req);
  assert.equal(res.status, 307);
  assert.match(res.headers.get('location') ?? '', /\/unauthorized$/);
});

test('middleware allows /admin when token is admin', () => {
  const token = signToken({ id: 'admin-1', role: 'admin' });
  const req = new NextRequest('http://localhost/admin/projects', {
    headers: { cookie: `token=${token}` },
  });

  const res = middleware(req);
  assert.equal(res.headers.get('location'), null);
});
