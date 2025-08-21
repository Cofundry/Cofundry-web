// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  console.log('✅ Middleware hit for:', request.nextUrl.pathname);

  // Check if the request is for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value;
    
    // If no token or invalid token, redirect to login
    if (!token || !verifyToken(token)) {
      console.log('🔒 Redirecting to login - no valid token');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    console.log('✅ Valid token found, allowing access to dashboard');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard'],
};
