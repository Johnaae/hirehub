import { SignJWT, jwtVerify } from 'jose';
import type { AdminRole } from './tenant';

export const COMPANY_SESSION_COOKIE = 'company_session';
export const SUPER_ADMIN_SESSION_COOKIE = 'super_admin_session';
/** @deprecated legacy single cookie — cleared on login */
export const LEGACY_SESSION_COOKIE = 'admin_token';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return new TextEncoder().encode(secret);
}

export interface AdminSession {
  id: number;
  email: string;
  companyId: number;
  role: AdminRole;
  impersonateCompanyId?: number | null;
}

export async function signAdminToken(admin: AdminSession) {
  return new SignJWT({
    id: admin.id,
    email: admin.email,
    companyId: admin.companyId,
    role: admin.role,
    impersonateCompanyId: admin.impersonateCompanyId ?? null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.id !== 'number' || typeof payload.email !== 'string') return null;
    if (typeof payload.companyId !== 'number' || typeof payload.role !== 'string') return null;

    const role = payload.role as AdminRole;
    if (!['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(role)) return null;

    return {
      id: payload.id,
      email: payload.email,
      companyId: payload.companyId,
      role,
      impersonateCompanyId:
        typeof payload.impersonateCompanyId === 'number' ? payload.impersonateCompanyId : null,
    };
  } catch {
    return null;
  }
}

function baseCookieOptions(name: string) {
  return {
    name,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function getCompanyCookieOptions() {
  return baseCookieOptions(COMPANY_SESSION_COOKIE);
}

export function getSuperAdminCookieOptions() {
  return baseCookieOptions(SUPER_ADMIN_SESSION_COOKIE);
}

/** @deprecated use getCompanyCookieOptions */
export function getAuthCookieOptions() {
  return getCompanyCookieOptions();
}

/** @deprecated use COMPANY_SESSION_COOKIE */
export const COOKIE_NAME = COMPANY_SESSION_COOKIE;
