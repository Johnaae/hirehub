import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyByCareerRef } from '@/lib/company';

export async function GET(request: NextRequest) {
  const companySlug = request.nextUrl.searchParams.get('company');
  if (!companySlug) {
    return NextResponse.json({ error: 'Company slug is required' }, { status: 400 });
  }

  const company = await getCompanyByCareerRef(companySlug);
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
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ jobs });
}
