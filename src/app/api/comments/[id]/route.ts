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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { projectId, text } = body;
    
    if (!projectId || !text) {
      return NextResponse.json({ error: "Project ID and text are required" }, { status: 400 });
    }

    if (!ObjectId.isValid(id) || !ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const db = await getDB();
    const commentsCollection = db.collection('comments');
    
    // Find the comment and ensure user owns it
    const comment = await commentsCollection.findOne({
      _id: new ObjectId(id),
      projectId,
      userId: user.id
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found or access denied" }, { status: 404 });
    }

    // Update the comment
    await commentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          text, 
          updatedAt: new Date() 
        } 
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    if (!ObjectId.isValid(id) || !ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const db = await getDB();
    const commentsCollection = db.collection('comments');
    
    // Find the comment and ensure user owns it
    const comment = await commentsCollection.findOne({
      _id: new ObjectId(id),
      projectId,
      userId: user.id
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found or access denied" }, { status: 404 });
    }

    // Delete the comment
    await commentsCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
