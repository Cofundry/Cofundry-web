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

// ===== Helper: Get authenticated user =====
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

// ===== Helper: Extract userId from URL =====
function getUserIdFromUrl(request: NextRequest) {
  const segments = request.nextUrl.pathname.split('/'); // e.g., /api/users/[userId]
  return segments[segments.length - 1];
}

// ===== GET: Fetch user by ID, email, or name =====
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromUrl(request);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = await getDB();
    const usersCollection = db.collection('users');

    let user;

    // Try to find by ObjectId first
    if (ObjectId.isValid(userId)) {
      user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    }

    // If not found by ObjectId, try to find by email or name
    if (!user) {
      user = await usersCollection.findOne({
        $or: [
          { email: userId },
          { name: { $regex: userId, $options: 'i' } },
        ],
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// ===== PUT: Update user info =====
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = getUserIdFromUrl(request);

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Users can only update their own info
    if (authUser.id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();

    // Only allow updating certain fields
    const allowedFields = ['name', 'email', 'avatar', 'bio', 'location'];
    const updateData: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }
    updateData.updatedAt = new Date();

    const db = await getDB();
    const usersCollection = db.collection('users');

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
