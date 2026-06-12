import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.LMS_JWT_SECRET || 'wisdom-eye-lms-secret-change-in-production'
);
const COOKIE_NAME = 'lms_session';

// Routes that require being logged in
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/certificates'];

// Routes that require admin/staff access
const ADMIN_ROUTES = ['/admin'];

// Auth routes (redirect to dashboard if already logged in)
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  let session = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      session = payload;
    } catch {
      session = null;
    }
  }

  // Redirect logged-in users away from auth pages
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Protect student/user routes
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url));
    }
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    // Skip old admin page.js route (existing admin is separate)
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      const adminRoles = ['superadmin', 'admin', 'course_builder', 'evaluator'];
      if (!session || !adminRoles.includes(session.role)) {
        if (!session) {
          return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url));
        }
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/certificates/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/lms-admin/:path*',
    '/courses/:path*/learn/:path*',
  ],
};
