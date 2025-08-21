import { NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

interface JwtPayloadWithId {
  id: string;
  [key: string]: any;
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as JwtPayloadWithId | null;
    if (!payload || typeof payload !== 'object' || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDB();
    const models = await db.collection('model').find({ userId: new ObjectId(payload.id) }).toArray();
    return NextResponse.json({ models });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}





