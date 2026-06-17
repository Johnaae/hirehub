import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { tenantWhereId, notFound } from '@/lib/tenant';
import { notesSchema } from '@/lib/validation';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const { id } = await params;
  const applicantId = parseInt(id, 10);

  const applicant = await prisma.applicant.findFirst({
    where: tenantWhereId(companyId, applicantId),
  });
  if (!applicant) return notFound('Applicant not found');

  const notes = await prisma.applicantNote.findMany({
    where: { applicantId, companyId },
    include: { admin: { select: { email: true, name: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ notes });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { session, companyId } = auth;

  try {
    const { id } = await params;
    const applicantId = parseInt(id, 10);
    if (isNaN(applicantId)) {
      return NextResponse.json({ error: 'Invalid applicant ID' }, { status: 400 });
    }

    const applicant = await prisma.applicant.findFirst({
      where: tenantWhereId(companyId, applicantId),
    });
    if (!applicant) return notFound('Applicant not found');

    const body = await request.json();
    const parsed = notesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid notes' }, { status: 400 });
    }

    const existing = await prisma.applicantNote.findFirst({
      where: { applicantId, adminId: session.id, companyId },
      orderBy: { updatedAt: 'desc' },
    });

    let note;
    if (existing) {
      note = await prisma.applicantNote.update({
        where: { id: existing.id, companyId },
        data: { content: parsed.data.notes },
        include: { admin: { select: { email: true, name: true } } },
      });
    } else {
      note = await prisma.applicantNote.create({
        data: {
          applicantId,
          adminId: session.id,
          companyId,
          content: parsed.data.notes,
        },
        include: { admin: { select: { email: true, name: true } } },
      });
    }

    await prisma.applicant.update({
      where: tenantWhereId(companyId, applicantId),
      data: { notes: parsed.data.notes },
    });

    return NextResponse.json({ note, applicant: { notes: parsed.data.notes } });
  } catch (err) {
    console.error('Update notes error:', err);
    return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 });
  }
}
