// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// You might need a server-side utility to verify the token/session from the cookie
// This would involve decoding the JWT and checking its validity without hitting the database on every request
// For this example, we'll just check if the cookie exists.
// In a real app, you'd want a robust token verification utility here.
// import { verifySessionCookie } from '@/lib/auth'; // A hypothetical utility

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const accessToken = request.cookies.get('accessToken')?.value; // Get access token from cookie

  // Define public routes that don't require authentication
  const publicPaths = ['/login', '/register', '/']; // Adjust as needed

  // If trying to access a public path
  if (publicPaths.includes(pathname)) {
    // If authenticated and trying to go to login/register, redirect to dashboard
    if (accessToken) { // More robust check here
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
    return NextResponse.next(); // Allow access to public path
  }

  // If trying to access a protected path and not authenticated
  if (!accessToken) { // More robust check here (e.g., await verifySessionCookie(accessToken))
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow access to protected path if authenticated
  return NextResponse.next();
}

// Define which paths the middleware should apply to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (your API routes if any, though auth for these should be handled on server actions/route handlers directly)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};