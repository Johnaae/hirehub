import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SUPER_ADMIN_SESSION_COOKIE, verifyAdminToken } from '@/lib/jwt';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPER_ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ loggedIn: false });
  }
  const session = await verifyAdminToken(token);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ loggedIn: false });
  }
  return NextResponse.json({
    loggedIn: true,
    email: session.email,
    impersonating: !!session.impersonateCompanyId,
  });
}
