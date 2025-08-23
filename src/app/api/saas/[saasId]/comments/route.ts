import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

interface AuthenticatedUser {
  id: string;
  email?: string;
  name?: string;
}

async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ saasId: string }> }
) {
  try {
    const { saasId } = await params;
    
    if (!ObjectId.isValid(saasId)) {
      return NextResponse.json(
        { error: 'Invalid SaaS ID' },
        { status: 400 }
      );
    }

    const db = await getDB();
    const commentsCollection = db.collection('saas_comments');

    // Get comments sorted by creation date (newest first)
    const comments = await commentsCollection
      .find({ saasId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ comments });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ saasId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to post comments' },
        { status: 401 }
      );
    }

    const { saasId } = await params;
    
    if (!ObjectId.isValid(saasId)) {
      return NextResponse.json(
        { error: 'Invalid SaaS ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    const db = await getDB();
    const saasCollection = db.collection('saas');
    const commentsCollection = db.collection('saas_comments');
    const usersCollection = db.collection('users');

    // Check if SaaS exists
    const saas = await saasCollection.findOne({ _id: new ObjectId(saasId) });
    if (!saas) {
      return NextResponse.json(
        { error: 'SaaS not found' },
        { status: 404 }
      );
    }

    // Get user details for better comment display
    const userDetails = await usersCollection.findOne({ _id: new ObjectId(user.id) });

    const comment = {
      saasId,
      authorId: user.id,
      authorName: userDetails?.name || user.name || 'Anonymous User',
      authorEmail: userDetails?.email || user.email || '',
      authorAvatar: userDetails?.avatar || '',
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await commentsCollection.insertOne(comment);

    return NextResponse.json({
      message: 'Comment added successfully',
      comment: {
        ...comment,
        _id: result.insertedId
      }
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
