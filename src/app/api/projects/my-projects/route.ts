import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

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
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const location = searchParams.get('location') || '';

    const db = await getDB();
    const projectsCollection = db.collection('projects');

    // Build filter object - only show user's own projects
    const filter: any = { authorId: user.id };
    
    if (search) {
      const escaped = escapeRegex(search);
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { tags: { $elemMatch: { $regex: escaped, $options: 'i' } } }
      ];
    }
    
    if (category) {
      const escaped = escapeRegex(category);
      filter.category = { $regex: `^${escaped}$`, $options: 'i' };
    }
    
    if (difficulty) {
      const escaped = escapeRegex(difficulty);
      filter.difficulty = { $regex: `^${escaped}$`, $options: 'i' };
    }
    
    if (location) {
      const escaped = escapeRegex(location);
      filter.location = { $regex: escaped, $options: 'i' };
    }

    // Get total count for pagination
    const totalProjects = await projectsCollection.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalProjects / limit));

    // Get projects with pagination
    const projects = await projectsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      projects,
      pagination: {
        currentPage: page,
        totalPages,
        totalProjects,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching user projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
