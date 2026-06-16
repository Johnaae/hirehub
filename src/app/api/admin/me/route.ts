import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';

export async function GET() {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { session, companyId } = auth;

  const [admin, company] = await Promise.all([
    prisma.admin.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, name: true },
    }),
    prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return NextResponse.json({
    admin: admin || { id: session.id, email: session.email },
    role: session.role,
    companyId: session.companyId,
    company: company ? { id: company.id, name: company.name, slug: company.slug } : null,
    impersonateCompanyId: session.impersonateCompanyId ?? null,
  });
}
