import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken, COOKIE_NAME } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const session = await verifyAdminToken(token);
      if (session) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyAdminToken(token);
    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
