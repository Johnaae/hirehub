import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_token';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return new TextEncoder().encode(secret);
}

export interface AdminSession {
  id: number;
  email: string;
}

export async function signAdminToken(admin: AdminSession) {
  return new SignJWT({ id: admin.id, email: admin.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.id !== 'number' || typeof payload.email !== 'string') return null;
    return { id: payload.id, email: payload.email };
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
