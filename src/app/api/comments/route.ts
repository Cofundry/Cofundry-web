import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const db = await getDB();
    const commentsCollection = db.collection('comments');
    
    const projectComments = await commentsCollection
      .find({ projectId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(projectComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, text, avatar } = body;
    
    if (!projectId || !text) {
      return NextResponse.json({ error: "Project ID and text are required" }, { status: 400 });
    }

    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const db = await getDB();
    const commentsCollection = db.collection('comments');
    const usersCollection = db.collection('users');
    
    // Get user details
    const userDetails = await usersCollection.findOne({ _id: new ObjectId(user.id) });
    
    const comment = {
      projectId,
      userId: user.id,
      userName: userDetails?.name || user.name || 'Anonymous User',
      userEmail: userDetails?.email || user.email || 'user@example.com',
      userAvatar: avatar || userDetails?.avatar || '',
      text,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await commentsCollection.insertOne(comment);
    
    return NextResponse.json({ 
      success: true, 
      comment: { ...comment, _id: result.insertedId }
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
