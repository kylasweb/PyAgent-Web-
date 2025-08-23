import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function middleware(request: NextRequest) {
  // Skip middleware for public routes
  const publicPaths = ['/login', '/api/auth/login', '/api/health', '/api/analyze-log'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for admin routes
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  
  if (isAdminPath) {
    // For demo purposes, we'll use a simple session check
    // In production, use proper JWT verification
    const authHeader = request.headers.get('authorization');
    const sessionToken = request.cookies.get('session')?.value || authHeader?.replace('Bearer ', '');

    if (!sessionToken) {
      // Redirect to login for admin routes without session
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    try {
      // Decode session token (simple base64 decode for demo)
      const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
      const [userId, timestamp] = decoded.split(':');
      
      // Check if session is valid (less than 24 hours old)
      const sessionAge = Date.now() - parseInt(timestamp);
      if (sessionAge > 24 * 60 * 60 * 1000) {
        // Session expired
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      // Verify user exists and has admin role
      const user = await db.user.findUnique({
        where: { id: userId }
      });

      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      // Add user info to request headers for API routes
      if (request.nextUrl.pathname.startsWith('/api/')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', userId);
        requestHeaders.set('x-user-role', user.role);
        
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};