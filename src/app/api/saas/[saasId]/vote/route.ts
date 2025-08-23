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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ saasId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
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

    const db = await getDB();
    const saasCollection = db.collection('saas');
    const votesCollection = db.collection('saas_votes');

    // Check if user already voted for this SaaS
    const existingVote = await votesCollection.findOne({
      saasId,
      userId: user.id
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted for this SaaS' },
        { status: 400 }
      );
    }

    // Check if SaaS exists and is approved
    const saas = await saasCollection.findOne({ _id: new ObjectId(saasId) });
    if (!saas) {
      return NextResponse.json(
        { error: 'SaaS not found' },
        { status: 404 }
      );
    }

    if (saas.status !== 'approved') {
      return NextResponse.json(
        { error: 'Can only vote for approved SaaS' },
        { status: 400 }
      );
    }

    // Create vote
    const vote = {
      saasId,
      userId: user.id,
      userName: user.name || 'Anonymous User',
      userEmail: user.email || '',
      createdAt: new Date()
    };

    await votesCollection.insertOne(vote);

    // Update SaaS vote counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayVote = await votesCollection.findOne({
      saasId,
      createdAt: { $gte: today }
    });

    const updateData: any = {
      $inc: { votes: 1 }
    };

    if (todayVote) {
      updateData.$inc.todayVotes = 1;
    }

    await saasCollection.updateOne(
      { _id: new ObjectId(saasId) },
      updateData
    );

    return NextResponse.json({
      message: 'Vote recorded successfully',
      votes: (saas.votes || 0) + 1,
      todayVotes: (saas.todayVotes || 0) + (todayVote ? 1 : 0)
    });

  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ saasId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
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

    const db = await getDB();
    const votesCollection = db.collection('saas_votes');
    const saasCollection = db.collection('saas');

    // Find and delete the vote
    const vote = await votesCollection.findOneAndDelete({
      saasId,
      userId: user.id
    });

    if (!vote) {
      return NextResponse.json(
        { error: 'No vote found to remove' },
        { status: 404 }
      );
    }

    // Update SaaS vote counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayVote = await votesCollection.findOne({
      saasId,
      createdAt: { $gte: today }
    });

    const updateData: any = {
      $inc: { votes: -1 }
    };

    if (vote.createdAt >= today) {
      updateData.$inc.todayVotes = -1;
    }

    await saasCollection.updateOne(
      { _id: new ObjectId(saasId) },
      updateData
    );

    return NextResponse.json({
      message: 'Vote removed successfully'
    });

  } catch (error) {
    console.error('Error removing vote:', error);
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    );
  }
}
