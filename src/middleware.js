import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host') || '';
  const url = new URL(request.url);
  const tenantParam = url.searchParams.get('tenant');
  
  // Create a new headers object so we can pass host context downstream
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-host', hostname);

  // Read existing tenant cookie
  const tenantCookie = request.cookies.get('x-tenant-slug')?.value;

  // Determine active tenant slug override
  let activeTenantSlug = '';
  if (tenantParam) {
    activeTenantSlug = tenantParam === 'clear' ? '' : tenantParam;
  } else if (tenantCookie) {
    activeTenantSlug = tenantCookie;
  }

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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|json)$).*)',
  ],
};
