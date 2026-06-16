import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DEFAULT_COMPANY_ID, getCompanyBySlug } from '@/lib/company';

async function resolveCompanyId(companySlug: string | null): Promise<number | null> {
  if (!companySlug) return DEFAULT_COMPANY_ID;
  const company = await getCompanyBySlug(companySlug);
  return company?.id ?? null;
}

export async function GET(request: NextRequest) {
  const companySlug = request.nextUrl.searchParams.get('company');
  const companyId = await resolveCompanyId(companySlug);
  if (companyId === null) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const jobs = await prisma.job.findMany({
    where: { companyId, status: 'Open' },
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
