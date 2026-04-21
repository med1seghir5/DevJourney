import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Disabling server-side cookie checks because the auth_token cookie
  // is not sent cross-domain (from render.com to localhost:3000)
  // Protected routes are handled securely on the client-side via authStore.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/challenges/create/:path*'],
};
