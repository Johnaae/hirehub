import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { statusSchema } from '@/lib/validation';
import { sendStatusChangeEmail } from '@/lib/email';
import { logActivity } from '@/lib/activity';

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
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const previous = await prisma.applicant.findUnique({ where: { id: applicantId } });
    if (!previous) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }

    const applicant = await prisma.applicant.update({
      where: { id: applicantId },
      data: { status: parsed.data.status },
    });

    if (previous.status !== parsed.data.status) {
      await logActivity({
        action: 'Status Changed',
        details: `${previous.firstName} ${previous.lastName}: ${previous.status} → ${parsed.data.status}`,
        applicantId,
        adminId: session.id,
      });
      sendStatusChangeEmail(applicant, parsed.data.status).catch(console.error);
    }

    return NextResponse.json({ applicant });
  } catch (err) {
    console.error('Update status error:', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
