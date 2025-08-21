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
    const credentials = await db.collection('model').find({ userId: new ObjectId(payload.id) }).toArray();
    return NextResponse.json({ credentials });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token) as JwtPayloadWithId | null;
    if (!payload || typeof payload !== 'object' || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = payload.id;
    const body = await req.json();
    const { provider, model, apiKey, description, status } = body;
    if (!provider || !model || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const db = await getDB();
    const credentials = db.collection('model');
    const doc = {
      userId: new ObjectId(userId),
      provider,
      model,
      apiKey,
      description: description || '',
      status: status || 'active',
      createdAt: new Date(),
      lastUsedAt: null,
    };
    const result = await credentials.insertOne(doc);
    return NextResponse.json({ success: true, credential: { ...doc, _id: result.insertedId } });
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}
