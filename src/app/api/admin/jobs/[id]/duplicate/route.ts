import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { tenantWhere, tenantWhereId, notFound } from '@/lib/tenant';
import { slugify } from '@/lib/company';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const { id } = await params;
  const jobId = parseInt(id, 10);

  const original = await prisma.job.findFirst({ where: tenantWhereId(companyId, jobId) });
  if (!original) return notFound('Job not found');

  let slug = slugify(`${original.title}-copy`);
  const existing = await prisma.job.findFirst({ where: tenantWhere(companyId, { slug }) });
  if (existing) slug = `${slug}-${Date.now()}`;

  const job = await prisma.job.create({
    data: {
      companyId,
      slug,
      title: `${original.title} (Copy)`,
      department: original.department,
      employmentType: original.employmentType,
      salary: original.salary,
      description: original.description,
      requirements: original.requirements,
      benefits: original.benefits,
      location: original.location,
      openings: original.openings,
      status: 'Draft',
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
