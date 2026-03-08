import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/app/models/user';
import { connectToDatabase } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateAuthCredentials } from '@/lib/validation';

export async function POST(req: Request) {
  // 1. Guard check: If in production, return a 404 response immediately
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not Found', { status: 404 });
  }

  const rate = checkRateLimit(req, { keyPrefix: 'auth:signup', windowMs: 60_000, limit: 8 });
  if (!rate.ok) {
    return NextResponse.json({ error: 'Too many signup attempts' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = validateAuthCredentials(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { email, password } = parsed.data;
    await connectToDatabase();

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'admin', // change later if needed
    });

    return NextResponse.json({ message: 'User created', user });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
