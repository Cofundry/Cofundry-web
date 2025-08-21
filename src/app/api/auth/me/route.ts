import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { getDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const token = (await cookieStore).get('token')?.value;

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token) as { id?: string; email?: string } | null;
  if (!payload?.id) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const db = await getDB();
  const users = db.collection('users');
  const user = await users.findOne({ _id: new ObjectId(payload.id) });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ user: { id: user._id?.toString?.() || payload.id, name: user.name || '', email: user.email, avatar: user.avatar || '' } });
}
