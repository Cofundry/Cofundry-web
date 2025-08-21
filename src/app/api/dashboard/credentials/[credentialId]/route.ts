import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

interface JwtPayloadWithId {
  id: string;
  [key: string]: any;
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token) as JwtPayloadWithId | null;
    if (!payload || typeof payload !== 'object' || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = payload.id;
     const url = new URL(req.url);
    const pathnameParts = url.pathname.split('/');
    const credentialId = pathnameParts[pathnameParts.length - 1];
    const db = await getDB();
    const credentials = db.collection('model');
    const body = await req.json();
    const updateFields: any = {};
    if (body.provider) updateFields.provider = body.provider;
    if (body.model) updateFields.model = body.model;
    if (body.apiKey) updateFields.apiKey = body.apiKey;
    if (body.description) updateFields.description = body.description;
    if (body.status) updateFields.status = body.status;
    const result = await credentials.updateOne(
      { _id: new ObjectId(credentialId), userId: new ObjectId(userId) },
      { $set: updateFields }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Credential not found or not authorized' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update credential', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token) as JwtPayloadWithId | null;
    if (!payload || typeof payload !== 'object' || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = payload.id;
     const url = new URL(req.url);
    const pathnameParts = url.pathname.split('/');
    const credentialId = pathnameParts[pathnameParts.length - 1];
    const db = await getDB();
    const credentials = db.collection('model');
    const result = await credentials.deleteOne({ _id: new ObjectId(credentialId), userId: new ObjectId(userId) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Credential not found or not authorized' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete credential', details: String(err) }, { status: 500 });
  }
} 