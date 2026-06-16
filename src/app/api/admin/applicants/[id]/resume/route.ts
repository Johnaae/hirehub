import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { tenantWhereId, notFound } from '@/lib/tenant';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  try {
    const { id } = await params;
    const applicantId = parseInt(id, 10);
    if (isNaN(applicantId)) {
      return NextResponse.json({ error: 'Invalid applicant ID' }, { status: 400 });
    }

    const applicant = await prisma.applicant.findFirst({
      where: tenantWhereId(companyId, applicantId),
      select: { resumeUrl: true, resumeFilename: true },
    });

    if (!applicant?.resumeUrl) {
      return notFound('Resume not found');
    }

    return NextResponse.redirect(applicant.resumeUrl);
  } catch (err) {
    console.error('Resume download error:', err);
    return NextResponse.json({ error: 'Failed to download resume' }, { status: 500 });
  }
}
