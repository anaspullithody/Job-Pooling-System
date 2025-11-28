import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// JWT verification for Edge runtime (no Prisma dependency)
function verifyDriverToken(
  token: string
): { userId: string; phone: string; role: string } | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      phone: string;
      role: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Routes that require Clerk authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/dashboard(.*)'
]);

// Routes for driver (custom auth)
const isDriverRoute = createRouteMatcher(['/driver(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Handle driver routes with custom auth
  if (isDriverRoute(req)) {
    // Allow login page
    if (pathname === '/driver/login' || pathname === '/driver/reset-pin') {
      return NextResponse.next();
    }

    // Check driver token for other driver routes
    const token = req.cookies.get('driver_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/driver/login', req.url));
    }

    const payload = verifyDriverToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/driver/login', req.url));
      response.cookies.delete('driver_token');
      return response;
    }

    return NextResponse.next();
  }

  // Handle protected dashboard routes with Clerk
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
