import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/app/models/user';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: Request) {
  // 1. Guard check: If in production, return a 404 response immediately
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const { email, password } = await req.json();
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