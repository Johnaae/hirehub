import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/tenant';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireSuperAdmin();
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const companyId = parseInt(id, 10);
  const body = await request.json();

  if (body.action === 'suspend') {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { status: 'suspended' },
    });
    return NextResponse.json({ company });
  }

  if (body.action === 'activate') {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { status: 'active' },
    });
    return NextResponse.json({ company });
  }

  if (body.subscriptionStatus) {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { subscriptionStatus: body.subscriptionStatus },
    });
    return NextResponse.json({ company });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireSuperAdmin();
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const companyId = parseInt(id, 10);

  if (companyId === 1) {
    return NextResponse.json({ error: 'Cannot delete the default company' }, { status: 403 });
  }

  await prisma.company.delete({ where: { id: companyId } });
  return NextResponse.json({ message: 'Company deleted' });
}

const resetSchema = z.object({
  newPassword: z.string().min(8),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await requireSuperAdmin();
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const companyId = parseInt(id, 10);
  const body = await request.json();

  if (body.action === 'reset-owner-password') {
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const owner = await prisma.admin.findFirst({
      where: { companyId, role: 'OWNER' },
    });
    if (!owner) return NextResponse.json({ error: 'Owner not found' }, { status: 404 });

    await prisma.admin.update({
      where: { id: owner.id },
      data: { passwordHash: await hashPassword(parsed.data.newPassword) },
    });

    return NextResponse.json({ message: 'Owner password reset' });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
