import { NextResponse } from 'next/server';
import { getCompanySession, getSuperAdminSession, type AdminSession } from './auth';

export type AdminRole = 'SUPER_ADMIN' | 'OWNER' | 'MANAGER';

export const ADMIN_ROLES: AdminRole[] = ['SUPER_ADMIN', 'OWNER', 'MANAGER'];

export function isSuperAdmin(session: AdminSession): boolean {
  return session.role === 'SUPER_ADMIN';
}

export function isOwner(session: AdminSession): boolean {
  return session.role === 'OWNER' || session.role === 'SUPER_ADMIN';
}

export function isManager(session: AdminSession): boolean {
  return session.role === 'MANAGER';
}

/** Effective tenant company for queries — respects super-admin impersonation. */
export function getEffectiveCompanyId(session: AdminSession): number {
  if (session.role === 'SUPER_ADMIN' && session.impersonateCompanyId) {
    return session.impersonateCompanyId;
  }
  return session.companyId;
}

export function tenantWhere(companyId: number, where: Record<string, unknown> = {}) {
  return { ...where, companyId };
}

export function tenantWhereId(companyId: number, id: number) {
  return { id, companyId };
}

type AuthResult =
  | { session: AdminSession; companyId: number }
  | { error: NextResponse };

export async function requireAdminSession(): Promise<AuthResult> {
  const session = await getCompanySession();
  if (!session) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }
  if (session.role === 'SUPER_ADMIN' && !session.impersonateCompanyId) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }
  return { session, companyId: getEffectiveCompanyId(session) };
}

export async function requireSuperAdmin(): Promise<
  | { session: AdminSession }
  | { error: NextResponse }
> {
  const session = await getSuperAdminSession();
  if (!session) {
    return { error: NextResponse.json({ error: 'Super admin authentication required' }, { status: 401 }) };
  }
  return { session };
}

export async function requireOwner(): Promise<AuthResult> {
  const result = await requireAdminSession();
  if ('error' in result) return result;
  if (result.session.role === 'MANAGER') {
    return { error: NextResponse.json({ error: 'Owner access required' }, { status: 403 }) };
  }
  return result;
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}
