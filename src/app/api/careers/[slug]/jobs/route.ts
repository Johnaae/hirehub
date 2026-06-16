import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyBySlug } from '@/lib/company';
import { DEFAULT_COMPANY_ID } from '@/lib/company';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('company');

  let companyId = DEFAULT_COMPANY_ID;
  if (slug) {
    const company = await getCompanyBySlug(slug);
    if (!company || company.status === 'suspended') {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    companyId = company.id;
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
      openings: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ jobs });
}
