import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyByCareerRef } from '@/lib/company';

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const company = await getCompanyByCareerRef(slug);

  if (!company || company.status === 'suspended') {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id, status: 'Open' },
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
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ jobs });
}
