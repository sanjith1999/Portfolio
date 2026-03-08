import { NextResponse } from 'next/server';

function buildLogoutResponse() {
  const res = NextResponse.json({ message: 'Logged out' });

  res.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0), // delete cookie
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return res;
}

export async function GET() {
  return buildLogoutResponse();
}

export async function POST() {
  return buildLogoutResponse();
}
