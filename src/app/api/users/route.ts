// app/api/users/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import User from '@/app/models/user';
import { requireAdmin } from '@/lib/api-auth';
import { connectToDatabase } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { parsePagination, validateAuthCredentials } from '@/lib/validation';

export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const rate = checkRateLimit(request, { keyPrefix: 'users:post', windowMs: 60_000, limit: 10 });
  if (!rate.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = validateAuthCredentials(body);
    if (!parsed.ok) {
      return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
    }

    await connectToDatabase();

    const exists = await User.findOne({ email: parsed.data.email });
    if (exists) {
      return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
    }

    const password = await bcrypt.hash(parsed.data.password, 10);
    const role = body?.role === 'admin' ? 'admin' : 'user';

    const created = await User.create({
      email: parsed.data.email,
      password,
      role,
    });

    return NextResponse.json({ success: true, user: { id: created._id, email: created.email, role: created.role } });
  } catch (error) {
    console.error('Insert error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const rate = checkRateLimit(request, { keyPrefix: 'users:get', windowMs: 60_000, limit: 60 });
  if (!rate.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    await connectToDatabase();
    const { page, limit, skip } = parsePagination(request.url, { limit: 20, maxLimit: 100 });

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select('email role createdAt').lean(),
      User.countDocuments(),
    ]);

    return NextResponse.json({ success: true, items: users, meta: { page, limit, total } });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}
