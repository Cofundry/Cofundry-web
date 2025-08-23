import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { SaaS } from '@/lib/models/SaaS';
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

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'votes'; // votes, todayVotes, createdAt
    const status = searchParams.get('status') || 'approved'; // pending, approved, rejected, all

    const db = await getDB();
    const saasCollection = db.collection('saas');

    // Build filter object
    const filter: any = {};
    
    // Only add status filter if not "all"
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      const escaped = escapeRegex(search);
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { tags: { $elemMatch: { $regex: escaped, $options: 'i' } } }
      ];
    }

    if (category) {
      const escaped = escapeRegex(category);
      filter.category = { $regex: `^${escaped}$`, $options: 'i' };
    }

    // Build sort object
    let sort: any = {};
    if (sortBy === 'votes') {
      sort = { votes: -1, createdAt: -1 };
    } else if (sortBy === 'todayVotes') {
      sort = { todayVotes: -1, votes: -1 };
    } else if (sortBy === 'createdAt') {
      sort = { createdAt: -1 };
    }

    // Get total count for pagination
    const totalSaas = await saasCollection.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalSaas / limit));

    // Get SaaS with pagination
    const saasList = await saasCollection
      .find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Enrich missing author fields from users collection
    const missing = saasList.filter(s => (!s.authorName || !s.authorAvatar) && typeof s.authorId === 'string');
    if (missing.length > 0) {
      const authorIds = Array.from(new Set(missing.map((s: any) => s.authorId).filter(Boolean)));
      const objectIds = authorIds
        .filter((id: string) => ObjectId.isValid(id))
        .map((id: string) => new ObjectId(id));
      if (objectIds.length > 0) {
        const users = await db.collection('users').find({ _id: { $in: objectIds } }).toArray();
        const map = new Map(users.map((u: any) => [u._id.toString(), u]));
        for (const s of saasList as any[]) {
          const uid = typeof s.authorId === 'string' ? s.authorId : undefined;
          if (uid && map.has(uid)) {
            const u = map.get(uid);
            s.authorName = s.authorName || u?.name || 'Anonymous User';
            s.authorEmail = s.authorEmail || u?.email || '';
            s.authorAvatar = s.authorAvatar || u?.avatar || '';
          }
        }
      }
    }

    return NextResponse.json({
      saas: saasList,
      pagination: {
        currentPage: page,
        totalPages,
        totalSaas,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching SaaS:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SaaS' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      url,
      logo,
      features,
      category,
      tags
    } = body;

    if (!name || !description || !url || !logo || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDB();
    const users = db.collection('users');
    const saasCollection = db.collection('saas');

    // Get latest author info from DB
    const author = await users.findOne({ _id: new ObjectId(user.id) });

    const saas = {
      name,
      description,
      url,
      logo,
      features: features || [],
      category,
      tags: tags || [],
      authorId: user.id,
      authorName: author?.name || user.name || 'Anonymous User',
      authorEmail: author?.email || user.email || '',
      authorAvatar: author?.avatar || '',
      // Auto-approve all new submissions
      status: 'approved',
      votes: 0,
      todayVotes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    const result = await saasCollection.insertOne(saas);

    return NextResponse.json({
      message: 'SaaS submitted successfully',
      saasId: result.insertedId
    });

  } catch (error) {
    console.error('Error submitting SaaS:', error);
    return NextResponse.json(
      { error: 'Failed to submit SaaS' },
      { status: 500 }
    );
  }
}
