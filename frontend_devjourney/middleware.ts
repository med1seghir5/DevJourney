import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('refreshToken')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/challenges', '/leaderboard'];
  const authRoutes = ['/auth/login', '/auth/register'];

  // If trying to access protected route without token
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuth = authRoutes.some(route => pathname.startsWith(route));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isAuth && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/profile', '/profile/:path*', '/challenges', '/challenges/:path*', '/leaderboard', '/leaderboard/:path*', '/auth/:path*'],
};
