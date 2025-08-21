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
    const chatlogs = await db.collection('chatlogs').find({ userId: new ObjectId(payload.id) }).toArray();
    return NextResponse.json({ chatlogs });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
  

    const body = await req.json();
    const { botId, chatHistory } = body;
    if (!botId || !Array.isArray(chatHistory)) {
      return NextResponse.json({ error: 'Missing botId or chatHistory' }, { status: 400 });
    }
    const db = await getDB();
    const bot = await db.collection('bots').findOne({ _id: new ObjectId(botId) });
    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }
    const botName = bot.name || 'Unknown Bot';
    const userId = bot.userId;
    const result = await db.collection('chatlogs').insertOne({
      userId: new ObjectId(userId),
      botId: new ObjectId(botId),
      botName,
      chatHistory,
      createdAt: new Date(),
    });
    return NextResponse.json({ success: true, chatlogId: result.insertedId });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create chatlog', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token) as JwtPayloadWithId | null;
    if (!payload || typeof payload !== 'object' || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = payload.id;
    let chatlogId = '';
    const url = new URL(req.url);
    const deleteAll = url.searchParams.get('all') === 'true';
    if (deleteAll) {
      // Delete all chatlogs for this user
      const db = await getDB();
      const result = await db.collection('chatlogs').deleteMany({ userId: new ObjectId(userId) });
      return NextResponse.json({ success: true, deletedCount: result.deletedCount });
    }
    if (req.method === 'DELETE') {
      // Try to get id from query string
      chatlogId = url.searchParams.get('id') || '';
      // Or from body
      if (!chatlogId) {
        try {
          const body = await req.json();
          chatlogId = body.id;
        } catch {}
      }
    }
    if (!chatlogId) {
      return NextResponse.json({ error: 'Missing chatlog id' }, { status: 400 });
    }
    const db = await getDB();
    const result = await db.collection('chatlogs').deleteOne({ _id: new ObjectId(chatlogId), userId: new ObjectId(userId) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Chatlog not found or not authorized' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete chatlog', details: String(err) }, { status: 500 });
  }
}
