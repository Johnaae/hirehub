import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { tenantWhereId, notFound } from '@/lib/tenant';
import { statusSchema } from '@/lib/validation';
import { sendStatusChangeEmail } from '@/lib/email';
import { logActivity } from '@/lib/activity';

type RouteParams = { params: Promise<{ id: string }> };

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

    const body = await request.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const previous = await prisma.applicant.findFirst({
      where: tenantWhereId(companyId, applicantId),
    });
    if (!previous) return notFound('Applicant not found');

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
        companyId,
      });
      sendStatusChangeEmail(applicant, parsed.data.status).catch(console.error);
    }

    return NextResponse.json({ applicant });
  } catch (err) {
    console.error('Update status error:', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
