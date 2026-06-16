import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/tenant';
import { setSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  companyId: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if ('error' in auth) return auth.error;
  const { session } = auth;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id: parsed.data.companyId } });
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  await setSession({
    ...session,
    impersonateCompanyId: company.id,
  });

  return NextResponse.json({
    message: `Now impersonating ${company.name}`,
    company: { id: company.id, name: company.name, slug: company.slug },
    redirectTo: '/admin',
  });
}

export async function DELETE() {
  const auth = await requireSuperAdmin();
  if ('error' in auth) return auth.error;
  const { session } = auth;

  await setSession({
    ...session,
    impersonateCompanyId: null,
  });

  return NextResponse.json({ message: 'Impersonation ended', redirectTo: '/super-admin' });
}
