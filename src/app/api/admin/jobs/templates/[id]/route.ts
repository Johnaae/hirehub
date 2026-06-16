import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  const templateId = parseInt(id, 10);

  const template = await prisma.jobTemplate.findUnique({ where: { id: templateId } });
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  if (template.isSystem) {
    return NextResponse.json({ error: 'System templates cannot be deleted' }, { status: 403 });
  }

  await prisma.jobTemplate.delete({ where: { id: templateId } });
  return NextResponse.json({ message: 'Template deleted' });
}
