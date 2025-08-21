import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import cloudinary from '@/lib/cloudinary';
import { ObjectId } from 'mongodb';

async function uploadImageToCloudinary(file: File): Promise<any> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(base64String, {
    folder: 'user-avatars',
    resource_type: 'auto',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });

  return result;
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token) as { id?: string } | null;
    if (!payload?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const form = await req.formData();

    const name = form.get('name')?.toString();
    const avatarFile = form.get('avatar');

    const db = await getDB();
    const users = db.collection('users');

    const update: any = { updatedAt: new Date() };

    if (name && name.trim()) {
      update.name = name.trim();
    }

    if (avatarFile && typeof avatarFile !== 'string') {
      const uploaded = await uploadImageToCloudinary(avatarFile as File);
      update.avatar = uploaded.secure_url;
    }

    if (!update.name && !update.avatar) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const userObjectId = new ObjectId(payload.id);

    const result = await users.findOneAndUpdate(
      { _id: userObjectId },
      { $set: update },
      { returnDocument: 'after' as any }
    );

    const updatedUser = result?.value || (await users.findOne({ _id: userObjectId }));

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
