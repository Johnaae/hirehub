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
    });
    if (!applicant) return notFound('Applicant not found');

    return NextResponse.json({ applicant });
  } catch (err) {
    console.error('Fetch applicant error:', err);
    return NextResponse.json({ error: 'Failed to fetch applicant' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  try {
    const { id } = await params;
    const applicantId = parseInt(id, 10);
    if (isNaN(applicantId)) {
      return NextResponse.json({ error: 'Invalid applicant ID' }, { status: 400 });
    }

    const existing = await prisma.applicant.findFirst({
      where: tenantWhereId(companyId, applicantId),
    });
    if (!existing) return notFound('Applicant not found');

    const deleted = await prisma.applicant.delete({ where: tenantWhereId(companyId, applicantId) });
    return NextResponse.json({ message: 'Applicant deleted successfully', id: deleted.id });
  } catch (err) {
    console.error('Delete applicant error:', err);
    return NextResponse.json({ error: 'Failed to delete applicant' }, { status: 500 });
  }
}
