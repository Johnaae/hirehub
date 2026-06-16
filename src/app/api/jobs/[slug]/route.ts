import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DEFAULT_COMPANY_ID, getCompanyBySlug } from '@/lib/company';

type RouteParams = { params: Promise<{ slug: string }> };

async function resolveCompanyId(companySlug: string | null): Promise<number | null> {
  if (!companySlug) return DEFAULT_COMPANY_ID;
  const company = await getCompanyBySlug(companySlug);
  return company?.id ?? null;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const companySlug = request.nextUrl.searchParams.get('company');
  const companyId = await resolveCompanyId(companySlug);
  if (companyId === null) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const job = await prisma.job.findFirst({
    where: { companyId, slug, status: 'Open' },
  });

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  return NextResponse.json({ job });
}
