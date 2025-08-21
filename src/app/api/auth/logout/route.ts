// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });

  // Remove the cookie by setting Max-Age to 0
  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
