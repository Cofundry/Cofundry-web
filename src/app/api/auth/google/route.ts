import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { signToken } from '@/lib/jwt';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!; // e.g. https://yourdomain.com/api/auth/google

async function getTokens(code: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });
  return res.json();
}

async function getGoogleUser(access_token: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  return res.json();
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    // Step 1: Redirect to Google
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  }

  console.log('Google OAuth: code received', code);
  const { access_token } = await getTokens(code);
  console.log('Google OAuth: access_token', access_token);
  const profile = await getGoogleUser(access_token);
  console.log('Google OAuth: profile', profile);
  if (!profile.email) {
    return NextResponse.json({ error: 'No email from Google' }, { status: 400 });
  }

  const db = await getDB();
  const users = db.collection('users');
  let user = await users.findOne({ email: profile.email, provider: "google" }); // or "github"
  if (user && user.providerToken === access_token) {
    // Log in
  } else if (!user) {
    // Register as above
    const newUser = {
      name: profile.name || profile.email,
      email: profile.email,
      provider: "google", // or "github"
      providerToken: access_token
    };
    const result = await users.insertOne(newUser);
    user = await users.findOne({ _id: result.insertedId });
  }
  if (!user) {
    return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
  }
  // Log in (set JWT cookie)
  const token = signToken({ id: user._id, email: user.email, name: user.name });
  const origin = req.nextUrl.origin;
  const response = NextResponse.redirect(`${origin}/dashboard`);
  response.cookies.set('token', token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
} 
