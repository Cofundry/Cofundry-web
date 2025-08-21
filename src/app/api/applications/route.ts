import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) return null;
    
    const id = decoded.id?.toString?.() || decoded.id;
    if (!id) return null;
    
    return { 
      id, 
      email: decoded.email, 
      name: decoded.name 
    };
  } catch (error) {
    return null;
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
    const { projectId, coverLetter, portfolio, github, linkedin, experience, availability } = body;

    if (!projectId || !coverLetter || !experience || !availability) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDB();
    const applicationsCollection = db.collection('applications');

    // Check if user already applied to this project
    const existingApplication = await applicationsCollection.findOne({
      projectId,
      applicantId: user.id
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Already applied' },
        { status: 400 }
      );
    }

    // Create new application
    const application = {
      projectId,
      applicantId: user.id,
      applicantName: user.name,
      applicantEmail: user.email,
      coverLetter,
      portfolio: portfolio || '',
      github: github || '',
      linkedin: linkedin || '',
      experience,
      availability,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await applicationsCollection.insertOne(application);

    return NextResponse.json({
      message: 'Application submitted successfully',
      applicationId: result.insertedId
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
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
    const limit = parseInt(searchParams.get('limit') || '10');

    const db = await getDB();
    const applicationsCollection = db.collection('applications');

    // Get applications for projects owned by the user
    const projectsCollection = db.collection('projects');
    const userProjects = await projectsCollection.find({ authorId: user.id }).toArray();
    const userProjectIds = userProjects.map(project => project._id.toString());

    const filter = { projectId: { $in: userProjectIds } };

    // Get total count for pagination
    const totalApplications = await applicationsCollection.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalApplications / limit));

    // Get applications with pagination
    const applications = await applicationsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      applications,
      pagination: {
        currentPage: page,
        totalPages,
        totalApplications,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
