import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COMPANY_SESSION_COOKIE, verifyAdminToken } from '@/lib/jwt';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COMPANY_SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ loggedIn: false });
  }
  const session = await verifyAdminToken(token);
  if (!session || (session.role === 'SUPER_ADMIN' && !session.impersonateCompanyId)) {
    return NextResponse.json({ loggedIn: false });
  }
  return NextResponse.json({
    loggedIn: true,
    email: session.email,
    role: session.role,
    impersonating: !!session.impersonateCompanyId,
  });
}
