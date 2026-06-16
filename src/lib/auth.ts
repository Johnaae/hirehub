import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  signAdminToken,
  verifyAdminToken,
  getAuthCookieOptions,
  COOKIE_NAME,
  type AdminSession,
} from './jwt';
import { assertCompanyActive } from './company-service';
import { isSuperAdmin, requireAdminSession } from './tenant';

export type { AdminSession };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function setSession(admin: AdminSession) {
  const token = await signAdminToken(admin);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, getAuthCookieOptions());
}

export async function requireActiveTenant(): Promise<
  | { session: AdminSession; companyId: number }
  | { error: NextResponse }
> {
  const result = await requireAdminSession();
  if ('error' in result) return result;

  if (isSuperAdmin(result.session) && !result.session.impersonateCompanyId) {
    return result;
  }

  const check = await assertCompanyActive(result.companyId);
  if (!check.ok) {
    return {
      error: NextResponse.json(
        { error: check.reason, suspended: check.reason === 'Company suspended' },
        { status: 403 }
      ),
    };
  }

  return result;
}

export { signAdminToken, verifyAdminToken, getAuthCookieOptions, COOKIE_NAME };
