import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    const decoded = verifyToken(token) as any;
    if (!decoded) return null;
    const id = decoded.id?.toString?.() || decoded.id;
    if (!id) return null;
    return { id, email: decoded.email, name: decoded.name };
  } catch {
    return null;
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ saasId: string; id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { saasId, id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 });
    if (!ObjectId.isValid(id) || !ObjectId.isValid(saasId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const db = await getDB();
    const commentsCollection = db.collection('saas_comments');

    // Ensure the comment exists and belongs to the user
    const comment = await commentsCollection.findOne({ _id: new ObjectId(id), saasId });
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    if (comment.authorId !== user.id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    await commentsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { content: content.trim(), updatedAt: new Date() } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating saas comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ saasId: string; id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { saasId, id } = await params;
    const { searchParams } = new URL(request.url);
    // optional validation
    if (!ObjectId.isValid(id) || !ObjectId.isValid(saasId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const db = await getDB();
    const commentsCollection = db.collection('saas_comments');

    const comment = await commentsCollection.findOne({ _id: new ObjectId(id), saasId });
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    if (comment.authorId !== user.id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    await commentsCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting saas comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
