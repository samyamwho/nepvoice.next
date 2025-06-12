import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const WHOAMI_ENDPOINT = process.env.NEXT_PUBLIC_WHOAMI_ENDPOINT;

const protectedRoutes = ['/main'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }


  try {
    if (!WHOAMI_ENDPOINT) {
      console.error('WHOAMI_ENDPOINT not configured');
      return NextResponse.redirect(new URL('/googleauth', request.url));
    }

    const response = await fetch(WHOAMI_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/googleauth', request.url));
    }
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