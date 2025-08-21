import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

interface JwtPayloadWithId {
  id: string;
  [key: string]: any;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathnameParts = url.pathname.split('/');
    const botId = pathnameParts[pathnameParts.length - 2];
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token) as JwtPayloadWithId | null;
    if (!payload || typeof payload !== 'object' || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const db = await getDB();
    const bots = db.collection('bots');
    const bot = await bots.findOne({ _id: new ObjectId(botId), userId: new ObjectId(payload.id) });
    if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    return NextResponse.json({ actions: bot.actions || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to get actions', details: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathnameParts = url.pathname.split('/');
    const botId = pathnameParts[pathnameParts.length - 2];
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token) as JwtPayloadWithId | null;
    if (!payload || typeof payload !== 'object' || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const db = await getDB();
    const bots = db.collection('bots');
    const body = await req.json();
    if (!Array.isArray(body.actions)) {
      return NextResponse.json({ error: 'actions must be an array' }, { status: 400 });
    }
    const result = await bots.updateOne(
      { _id: new ObjectId(botId), userId: new ObjectId(payload.id) },
      { $set: { actions: body.actions } }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Bot not found or not authorized' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update actions', details: String(err) }, { status: 500 });
  }
} 