import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = new URL(request.url);
  const tenantParam = url.searchParams.get('tenant');
  const tenantCookie = request.cookies.get('x-tenant-slug')?.value;

  // Fast path: if no custom tenant override, don't modify headers so Vercel can cache at Edge
  if (!tenantParam && !tenantCookie) {
    return NextResponse.next();
  }

  // Determine active tenant slug override
  let activeTenantSlug = '';
  if (tenantParam) {
    activeTenantSlug = tenantParam === 'clear' ? '' : tenantParam;
  } else if (tenantCookie) {
    activeTenantSlug = tenantCookie;
  }

  const requestHeaders = new Headers(request.headers);
  if (activeTenantSlug) {
    requestHeaders.set('x-tenant-slug', activeTenantSlug);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Persist or clear the cookie if the parameter was explicitly provided
  if (tenantParam) {
    if (tenantParam === 'clear') {
      response.cookies.delete('x-tenant-slug');
    } else {
      response.cookies.set('x-tenant-slug', tenantParam, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }
  }

  return response;
}

// Enable middleware for all routes except api, static files, images, icons, and fonts
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|json|txt|xml)$).*)',
  ],
};
