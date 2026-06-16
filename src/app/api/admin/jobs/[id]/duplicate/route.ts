import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { slugify, DEFAULT_COMPANY_ID } from '@/lib/company';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  const jobId = parseInt(id, 10);

  const original = await prisma.job.findUnique({ where: { id: jobId } });
  if (!original) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  let slug = slugify(`${original.title}-copy`);
  const existing = await prisma.job.findFirst({ where: { companyId: DEFAULT_COMPANY_ID, slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const job = await prisma.job.create({
    data: {
      companyId: DEFAULT_COMPANY_ID,
      slug,
      title: `${original.title} (Copy)`,
      department: original.department,
      employmentType: original.employmentType,
      salary: original.salary,
      description: original.description,
      requirements: original.requirements,
      benefits: original.benefits,
      location: original.location,
      status: 'Draft',
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
