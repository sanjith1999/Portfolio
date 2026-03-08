import assert from 'node:assert/strict';
import test from 'node:test';

process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/portfolio-test';

test('projects GET requires admin auth', async () => {
  const { GET } = await import('@/app/api/projects/route');
  const res = await GET(new Request('http://localhost/api/projects'));
  assert.equal(res.status, 401);
});

test('projects POST requires admin auth', async () => {
  const { POST } = await import('@/app/api/projects/route');
  const res = await POST(
    new Request('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Sample' }),
    })
  );
  assert.equal(res.status, 401);
});

test('project PUT requires admin auth', async () => {
  const { PUT } = await import('@/app/api/projects/[id]/route');
  const res = await PUT(
    new Request('http://localhost/api/projects/0123456789abcdef01234567', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Sample' }),
    }),
    { params: Promise.resolve({ id: '0123456789abcdef01234567' }) }
  );
  assert.equal(res.status, 401);
});

test('project DELETE requires admin auth', async () => {
  const { DELETE } = await import('@/app/api/projects/[id]/route');
  const res = await DELETE(new Request('http://localhost/api/projects/0123456789abcdef01234567'), {
    params: Promise.resolve({ id: '0123456789abcdef01234567' }),
  });
  assert.equal(res.status, 401);
});
