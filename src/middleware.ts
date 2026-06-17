import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  verifyAdminToken,
  COMPANY_SESSION_COOKIE,
  SUPER_ADMIN_SESSION_COOKIE,
  LEGACY_SESSION_COOKIE,
} from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Company login pages — never auto-redirect
  if (pathname === '/login' || pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Super admin login page — never auto-redirect
  if (pathname === '/super-admin/login') {
    return NextResponse.next();
  }

  // Super admin panel (requires super_admin_session only)
  if (pathname.startsWith('/super-admin')) {
    const token = request.cookies.get(SUPER_ADMIN_SESSION_COOKIE)?.value;
    if (!token) {
      const loginUrl = new URL('/super-admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const session = await verifyAdminToken(token);
    if (!session || session.role !== 'SUPER_ADMIN') {
      const loginUrl = new URL('/super-admin/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(SUPER_ADMIN_SESSION_COOKIE);
      return response;
    }
    return NextResponse.next();
  }

  // Company admin panel (requires company_session only)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get(COMPANY_SESSION_COOKIE)?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyAdminToken(token);
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(COMPANY_SESSION_COOKIE);
      return response;
    }

    // Super admin impersonating uses company_session with impersonateCompanyId
    if (session.role === 'SUPER_ADMIN' && !session.impersonateCompanyId) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/super-admin/:path*', '/login', '/admin/login'],
};
