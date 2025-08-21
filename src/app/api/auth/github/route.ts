import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';
import { signToken } from '@/lib/jwt';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI!; // e.g. https://yourdomain.com/api/auth/github

async function getTokens(code: string) {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });
  return res.json();
}

async function getGithubUser(access_token: string) {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  return res.json();
}

async function getGithubEmail(access_token: string) {
  const res = await fetch('https://api.github.com/user/emails', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const emails = await res.json();
  return emails.find((e: any) => e.primary && e.verified)?.email || emails[0]?.email;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    // Step 1: Redirect to GitHub
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'read:user user:email',
      allow_signup: 'true',
    });
    return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
  }

  console.log('GitHub OAuth: code received', code);
  const { access_token } = await getTokens(code);
  console.log('GitHub OAuth: access_token', access_token);
  if (!access_token) {
    return NextResponse.json({ error: 'No access token from GitHub' }, { status: 400 });
  }
  const profile = await getGithubUser(access_token);
  console.log('GitHub OAuth: profile', profile);
  const email = profile.email || (await getGithubEmail(access_token));
  console.log('GitHub OAuth: email', email);
  if (!email) {
    return NextResponse.json({ error: 'No email from GitHub' }, { status: 400 });
  }

  const db = await getDB();
  const users = db.collection('users');
  let user = await users.findOne({ email, provider: "github" });
  if (user && user.providerToken === access_token) {
    // Log in
  } else if (!user) {
    // Register
    const newUser = {
      name: profile.name || profile.login || email,
      email,
      provider: "github",
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
  });
  return response;
} 