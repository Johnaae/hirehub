import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notesSchema } from '@/lib/validation';

type RouteParams = { params: Promise<{ id: string }> };

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

    const applicant = await prisma.applicant.update({
      where: { id: applicantId },
      data: { notes: parsed.data.notes },
    });

    return NextResponse.json({ applicant });
  } catch (err) {
    console.error('Update notes error:', err);
    return NextResponse.json({ error: 'Failed to update notes' }, { status: 404 });
  }
}
