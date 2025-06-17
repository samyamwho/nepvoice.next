import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const WHOAMI_ENDPOINT = process.env.NEXT_PUBLIC_WHOAMI_ENDPOINT;
const DEV_MODE_SKIP_AUTH = process.env.NEXT_PUBLIC_DEV_MODE_SKIP_AUTH === 'true';

// Remove /main from protected routes - let client handle auth
const protectedRoutes: string[] = [];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (DEV_MODE_SKIP_AUTH) {
    console.log('Middleware: DEV MODE - Skipping authentication check.');
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    if (!WHOAMI_ENDPOINT) {
      console.error('Middleware: WHOAMI_ENDPOINT not configured');
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
      console.log(`Middleware: Auth check failed with status ${response.status}. Redirecting to /googleauth for path: ${pathname}`);
      return NextResponse.redirect(new URL('/googleauth', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware: Authentication check failed with error:', error);
    return NextResponse.redirect(new URL('/googleauth', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|googleauth|main).*)',
  ],
};