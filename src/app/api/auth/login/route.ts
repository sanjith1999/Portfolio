import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/app/models/user';
import { connectToDatabase } from '@/lib/mongodb';
import { signToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateAuthCredentials } from '@/lib/validation';

export async function POST(req: Request) {
  const rate = checkRateLimit(req, { keyPrefix: 'auth:login', windowMs: 60_000, limit: 15 });
  if (!rate.ok) {
    return NextResponse.json({ error: 'Too many login attempts' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = validateAuthCredentials(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { email, password } = parsed.data;
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    const token = signToken({ id: user._id, role: user.role });

    const res = NextResponse.json({ message: 'Login successful' });
    res.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
