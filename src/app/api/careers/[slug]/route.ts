import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyBySlug } from '@/lib/company';
import { getStoreConfig } from '@/lib/config';

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company || company.status === 'suspended') {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const config = await getStoreConfig(company.id);

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
      openings: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ company: config, jobs });
}
