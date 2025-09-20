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

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const search = searchParams.get('search') || '';
    const name = searchParams.get('name') || '';
    const category = searchParams.get('category') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const location = searchParams.get('location') || '';
    const authorId = searchParams.get('authorId') || '';

    const db = await getDB();
    const projectsCollection = db.collection('projects');

    // Build filter object
    const filter: any = { status: 'open' };
    
    if (search) {
      const escaped = escapeRegex(search);
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { tags: { $elemMatch: { $regex: escaped, $options: 'i' } } }
      ];
    }

    if (name) {
      const escaped = escapeRegex(name);
      filter.title = { $regex: `^${escaped}`, $options: 'i' };
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
    
    if (authorId) {
      filter.authorId = authorId;
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

    // Enrich missing author fields from users collection
    const missing = projects.filter(p => (!p.authorName || !p.authorAvatar) && typeof p.authorId === 'string');
    if (missing.length > 0) {
      const authorIds = Array.from(new Set(missing.map((p: any) => p.authorId).filter(Boolean)));
      const objectIds = authorIds
        .filter((id: string) => ObjectId.isValid(id))
        .map((id: string) => new ObjectId(id));
      if (objectIds.length > 0) {
        const users = await db.collection('users').find({ _id: { $in: objectIds } }).toArray();
        const map = new Map(users.map((u: any) => [u._id.toString(), u]));
        for (const p of projects as any[]) {
          const uid = typeof p.authorId === 'string' ? p.authorId : undefined;
          if (uid && map.has(uid)) {
            const u = map.get(uid);
            p.authorName = p.authorName || u?.name || 'Anonymous User';
            p.authorEmail = p.authorEmail || u?.email || '';
            p.authorAvatar = p.authorAvatar || u?.avatar || '';
          }
        }
      }
    }

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
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
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
      title,
      description,
      logo,
      requirements,
      teamSize,
      teamComposition,
      developerRequirements,
      designerRequirements,
      marketerRequirements,
      commercialRequirements,
      techStack,
      tags,
      deadline,
      budget,
      location,
      category,
      difficulty,
      contactInfo
    } = body;

    if (!title || !description || !category || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDB();
    const users = db.collection('users');
    const projectsCollection = db.collection('projects');

    // pull latest author info from DB
    const author = await users.findOne({ _id: new ObjectId(user.id) });

    const project = {
      title,
      description,
      logo: logo || undefined,
      requirements: requirements || '',
      teamSize: teamSize || undefined,
      teamComposition: teamComposition || undefined,
      developerRequirements: developerRequirements || undefined,
      designerRequirements: designerRequirements || undefined,
      marketerRequirements: marketerRequirements || undefined,
      commercialRequirements: commercialRequirements || undefined,
      techStack: techStack || [],
      tags: tags || [],
      deadline: deadline || undefined,
      budget: budget || undefined,
      location: location || 'Remote',
      category,
      difficulty,
      authorId: user.id,
      authorName: author?.name || user.name || 'Anonymous User',
      authorEmail: author?.email || user.email,
      authorAvatar: author?.avatar || '',
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      contactInfo: contactInfo || {},
      attachments: []
    } as any;

    const result = await projectsCollection.insertOne(project);

    return NextResponse.json({
      message: 'Project created successfully',
      projectId: result.insertedId
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
