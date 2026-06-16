import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { tenantWhereId, notFound } from '@/lib/tenant';
import { JOB_STATUSES } from '@/lib/jobs';
import { z } from 'zod';

const jobSchema = z.object({
  title: z.string().min(1).optional(),
  department: z.string().optional().nullable(),
  employmentType: z.string().optional(),
  salary: z.string().optional().nullable(),
  description: z.string().optional(),
  requirements: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  status: z.enum(JOB_STATUSES).optional(),
  openings: z.number().int().positive().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const { id } = await params;
  const jobId = parseInt(id, 10);
  const job = await prisma.job.findFirst({
    where: tenantWhereId(companyId, jobId),
    include: { _count: { select: { applicants: true } } },
  });
  if (!job) return notFound('Job not found');
  return NextResponse.json({ job });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const { id } = await params;
  const jobId = parseInt(id, 10);
  const existing = await prisma.job.findFirst({ where: tenantWhereId(companyId, jobId) });
  if (!existing) return notFound('Job not found');

  const body = await request.json();
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }

  const job = await prisma.job.update({
    where: { id: jobId },
    data: parsed.data,
  });
  return NextResponse.json({ job });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const { id } = await params;
  const jobId = parseInt(id, 10);
  const existing = await prisma.job.findFirst({ where: tenantWhereId(companyId, jobId) });
  if (!existing) return notFound('Job not found');

  await prisma.job.delete({ where: { id: jobId } });
  return NextResponse.json({ message: 'Job deleted' });
}
