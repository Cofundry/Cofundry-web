import { NextResponse,NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDB } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const db = await getDB();
    const users = db.collection('users');

    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    await users.insertOne({ name, email, password: hashed });

    return NextResponse.json({ message: 'Registered successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
