import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyByCareerRef } from '@/lib/company';

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug: jobSlug } = await params;
  const companySlug = request.nextUrl.searchParams.get('company');
  if (!companySlug) {
    return NextResponse.json({ error: 'Company slug is required' }, { status: 400 });
  }

  const company = await getCompanyByCareerRef(companySlug);
  if (!company || company.status === 'suspended') {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const job = await prisma.job.findFirst({
    where: { companyId: company.id, slug: jobSlug, status: 'Open' },
  });

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  return NextResponse.json({ job });
}
