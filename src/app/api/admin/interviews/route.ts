import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { tenantWhere, tenantWhereId, notFound } from '@/lib/tenant';
import { sendInterviewEmail, sendStatusChangeEmail } from '@/lib/email';
import { logActivity } from '@/lib/activity';
import { getStoreConfig } from '@/lib/config';
import { z } from 'zod';

const interviewSchema = z.object({
  applicantId: z.number().int(),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T/)),
  notes: z.string().optional().nullable(),
  meetLink: z.string().url().optional().nullable().or(z.literal('')),
});

export async function GET() {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const interviews = await prisma.interview.findMany({
    where: tenantWhere(companyId),
    include: {
      applicant: { select: { firstName: true, lastName: true, email: true, position: true } },
      admin: { select: { email: true, name: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  return NextResponse.json({ interviews });
}

export async function POST(request: NextRequest) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { session, companyId } = auth;

  const body = await request.json();
  const parsed = interviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.errors }, { status: 400 });
  }

  const data = parsed.data;
  const applicant = await prisma.applicant.findFirst({
    where: tenantWhereId(companyId, data.applicantId),
  });
  if (!applicant) return notFound('Applicant not found');

  const interview = await prisma.interview.create({
    data: {
      companyId,
      applicantId: data.applicantId,
      adminId: session.id,
      scheduledAt: new Date(data.scheduledAt),
      notes: data.notes || null,
      meetLink: data.meetLink || null,
    },
    include: {
      applicant: true,
      admin: { select: { email: true, name: true } },
    },
  });

  await prisma.applicant.update({
    where: { id: data.applicantId },
    data: { status: 'Interview' },
  });

  await logActivity({
    action: 'Interview Scheduled',
    details: `${applicant.firstName} ${applicant.lastName} — ${new Date(data.scheduledAt).toLocaleString()}`,
    applicantId: data.applicantId,
    adminId: session.id,
    companyId,
  });

  const config = await getStoreConfig(companyId);
  sendInterviewEmail(applicant, interview, config.storeName).catch(console.error);
  sendStatusChangeEmail(applicant, 'Interview').catch(console.error);

  return NextResponse.json({ interview }, { status: 201 });
}
