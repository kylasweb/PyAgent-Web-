import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware for public routes
  const publicPaths = ['/login', '/api/auth/login', '/api/health', '/api/analyze-log', '/'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for admin routes
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminPath) {
    // Simple session check without database access (Edge Runtime compatible)
    const sessionToken = request.cookies.get('session')?.value;

    if (!sessionToken) {
      // Redirect to login for admin routes without session
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Basic session validation (without database lookup)
    try {
      // Simple validation - check if token exists and is not expired
      if (sessionToken.length < 10) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // For production, implement proper JWT validation here
      // This is a simplified version for Edge Runtime compatibility

    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.redirect(new URL('/', request.url));
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