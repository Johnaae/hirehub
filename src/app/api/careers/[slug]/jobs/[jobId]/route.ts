import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyBySlug } from '@/lib/company';
import { getStoreConfig } from '@/lib/config';

type RouteParams = { params: Promise<{ slug: string; jobId: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { slug, jobId: jobIdStr } = await params;
  const jobId = parseInt(jobIdStr, 10);

  if (isNaN(jobId)) {
    return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
  }

  const companyRecord = await getCompanyBySlug(slug);
  if (!companyRecord || companyRecord.status === 'suspended') {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId: companyRecord.id, status: 'Open' },
    select: {
      id: true,
      title: true,
      slug: true,
      department: true,
      employmentType: true,
      salary: true,
      location: true,
      description: true,
      requirements: true,
      benefits: true,
      openings: true,
    },
  });

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const company = await getStoreConfig(companyRecord.id);

  return NextResponse.json({ job, company });
}
