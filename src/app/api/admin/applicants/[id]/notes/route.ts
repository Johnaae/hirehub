import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notesSchema } from '@/lib/validation';
import { DEFAULT_COMPANY_ID } from '@/lib/company';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  const applicantId = parseInt(id, 10);

  const notes = await prisma.applicantNote.findMany({
    where: { applicantId },
    include: { admin: { select: { email: true, name: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ notes });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const applicantId = parseInt(id, 10);
    if (isNaN(applicantId)) {
      return NextResponse.json({ error: 'Invalid applicant ID' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = notesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid notes' }, { status: 400 });
    }

    // Upsert primary note for this admin/applicant
    const existing = await prisma.applicantNote.findFirst({
      where: { applicantId, adminId: session.id },
      orderBy: { updatedAt: 'desc' },
    });

    let note;
    if (existing) {
      note = await prisma.applicantNote.update({
        where: { id: existing.id },
        data: { content: parsed.data.notes },
        include: { admin: { select: { email: true, name: true } } },
      });
    } else {
      note = await prisma.applicantNote.create({
        data: {
          applicantId,
          adminId: session.id,
          companyId: DEFAULT_COMPANY_ID,
          content: parsed.data.notes,
        },
        include: { admin: { select: { email: true, name: true } } },
      });
    }

    // Keep legacy field in sync
    await prisma.applicant.update({
      where: { id: applicantId },
      data: { notes: parsed.data.notes },
    });

    return NextResponse.json({ note, applicant: { notes: parsed.data.notes } });
  } catch (err) {
    console.error('Update notes error:', err);
    return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 });
  }
}
