import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { tenantWhereId, notFound } from '@/lib/tenant';

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const { id } = await params;
  const templateId = parseInt(id, 10);

  const template = await prisma.jobTemplate.findFirst({
    where: tenantWhereId(companyId, templateId),
  });
  if (!template) return notFound('Template not found');
  if (template.isSystem) {
    return NextResponse.json({ error: 'System templates cannot be deleted' }, { status: 403 });
  }

  await prisma.jobTemplate.delete({ where: { id: templateId } });
  return NextResponse.json({ message: 'Template deleted' });
}
