import { SignJWT, jwtVerify } from 'jose';
import type { AdminRole } from './tenant';

const COOKIE_NAME = 'admin_token';

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

export function getAuthCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}

export { COOKIE_NAME };
