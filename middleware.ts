import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const WHOAMI_ENDPOINT = process.env.NEXT_PUBLIC_WHOAMI_ENDPOINT;

// Define which routes need protection
const protectedRoutes = ['/main']; // Your main route is protected

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current route needs protection
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check authentication on the server
  try {
    if (!WHOAMI_ENDPOINT) {
      console.error('WHOAMI_ENDPOINT not configured');
      return NextResponse.redirect(new URL('/googleauth', request.url));
    }

    // Forward the cookies from the original request
    const response = await fetch(WHOAMI_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      // User is not authenticated, redirect to auth
      return NextResponse.redirect(new URL('/googleauth', request.url));
    }

    // User is authenticated, allow access
    return NextResponse.next();
  } catch (error) {
    console.error('Authentication check failed:', error);
    return NextResponse.redirect(new URL('/googleauth', request.url));
  }
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     */
    '/((?!api|_next/static|_next/image|favicon.ico|googleauth).*)',
  ],
};