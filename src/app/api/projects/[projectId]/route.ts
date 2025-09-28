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

// ===== Helper: Extract projectId from URL =====
function getProjectIdFromUrl(request: NextRequest) {
  const segments = request.nextUrl.pathname.split('/'); // /api/projects/[projectId]
  return segments[segments.length - 1];
}

// ===== GET Project by ID =====
export async function GET(request: NextRequest) {
  try {
    const projectId = getProjectIdFromUrl(request);

    const db = await getDB();
    let project = null;

    // If projectId looks like an ObjectId, query by _id. Otherwise try slug or id fields.
    if (ObjectId.isValid(projectId)) {
      project = await db
        .collection('projects')
        .findOne({ _id: new ObjectId(projectId) });
    }

    if (!project) {
      // fallback: try slug or id fields (string matches)
      project = await db.collection('projects').findOne({
        $or: [
          { slug: projectId },
          { id: projectId },
        ],
      });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

// ===== PUT Project by ID =====
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const projectId = getProjectIdFromUrl(request);
    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const body = await request.json();
    const db = await getDB();
    const projectsCollection = db.collection('projects');

    // Ensure user owns the project
    const existingProject = await projectsCollection.findOne({
      _id: new ObjectId(projectId),
      authorId: user.id,
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    const usersCollection = db.collection('users');
    const author = await usersCollection.findOne({ _id: new ObjectId(user.id) });

    // Merge updated data
    const updateData = {
      ...body,
      authorName: author?.name || user.name || 'Anonymous User',
      authorEmail: author?.email || user.email,
      authorAvatar: author?.avatar || '',
      updatedAt: new Date(),
    };

    await projectsCollection.updateOne({ _id: new ObjectId(projectId) }, { $set: updateData });

    return NextResponse.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// ===== DELETE Project by ID =====
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const projectId = getProjectIdFromUrl(request);
    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const db = await getDB();
    const projectsCollection = db.collection('projects');

    // Ensure user owns the project
    const existingProject = await projectsCollection.findOne({
      _id: new ObjectId(projectId),
      authorId: user.id,
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    // Delete the project
    await projectsCollection.deleteOne({ _id: new ObjectId(projectId) });

    // Also delete related applications and comments
    const applicationsCollection = db.collection('applications');
    const commentsCollection = db.collection('comments');
    
    await applicationsCollection.deleteMany({ projectId });
    await commentsCollection.deleteMany({ projectId });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
