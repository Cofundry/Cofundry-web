import { NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb'; // Make sure this is correct path

export async function GET() {
  try {
    const db = await getDB();
    const users = await db.collection('users').find().toArray();

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
