import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  signAdminToken,
  verifyAdminToken,
  COMPANY_SESSION_COOKIE,
  SUPER_ADMIN_SESSION_COOKIE,
  LEGACY_SESSION_COOKIE,
  getCompanyCookieOptions,
  getSuperAdminCookieOptions,
  type AdminSession,
} from './jwt';
import { assertCompanyActive } from './company-service';

export type { AdminSession };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getCompanySession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COMPANY_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function getSuperAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPER_ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifyAdminToken(token);
  if (!session || session.role !== 'SUPER_ADMIN') return null;
  return session;
}

/** @deprecated use getCompanySession */
export async function getSession(): Promise<AdminSession | null> {
  return getCompanySession();
}

export async function setCompanySession(admin: AdminSession) {
  const token = await signAdminToken(admin);
  const cookieStore = await cookies();
  cookieStore.set(COMPANY_SESSION_COOKIE, token, getCompanyCookieOptions());
}

export async function setSuperAdminSession(admin: AdminSession) {
  const token = await signAdminToken({ ...admin, role: 'SUPER_ADMIN', impersonateCompanyId: admin.impersonateCompanyId ?? null });
  const cookieStore = await cookies();
  cookieStore.set(SUPER_ADMIN_SESSION_COOKIE, token, getSuperAdminCookieOptions());
}

export async function clearCompanySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COMPANY_SESSION_COOKIE);
}

export async function clearSuperAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SUPER_ADMIN_SESSION_COOKIE);
}

/** Clears legacy cookie */
export async function clearLegacySession() {
  const cookieStore = await cookies();
  cookieStore.delete(LEGACY_SESSION_COOKIE);
}

/** @deprecated use clearCompanySession */
export async function clearSession() {
  await clearCompanySession();
}

/** @deprecated use setCompanySession */
export async function setSession(admin: AdminSession) {
  await setCompanySession(admin);
}

export async function requireActiveTenant(): Promise<
  | { session: AdminSession; companyId: number }
  | { error: NextResponse }
> {
  const session = await getCompanySession();
  if (!session) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }

  if (session.role === 'SUPER_ADMIN' && !session.impersonateCompanyId) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }

  const companyId =
    session.role === 'SUPER_ADMIN' && session.impersonateCompanyId
      ? session.impersonateCompanyId
      : session.companyId;

  if (session.role === 'SUPER_ADMIN' && session.impersonateCompanyId) {
    return { session, companyId };
  }

  const check = await assertCompanyActive(companyId);
  if (!check.ok) {
    return {
      error: NextResponse.json(
        { error: check.reason, suspended: check.reason === 'Company suspended' },
        { status: 403 }
      ),
    };
  }

  return { session, companyId };
}

export {
  signAdminToken,
  verifyAdminToken,
  getCompanyCookieOptions,
  getSuperAdminCookieOptions,
  COMPANY_SESSION_COOKIE,
  SUPER_ADMIN_SESSION_COOKIE,
};
