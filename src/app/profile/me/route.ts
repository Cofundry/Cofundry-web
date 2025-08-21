import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const token = (await cookieStore).get('token')?.value;

  if (!token) return NextResponse.redirect(new URL('/login', request.url));
  const payload = verifyToken(token) as { id?: string } | null;
  if (!payload?.id) return NextResponse.redirect(new URL('/login', request.url));

  return NextResponse.redirect(new URL(`/profile/${payload.id}`, request.url));
}
