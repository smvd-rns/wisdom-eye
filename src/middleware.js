import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host') || '';
  
  // Create a new headers object so we can pass host context downstream
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-host', hostname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Enable middleware for all API routes and page requests
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
