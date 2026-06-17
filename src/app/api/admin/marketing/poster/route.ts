import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { notFound } from '@/lib/tenant';
import { generateHiringPosterPdf } from '@/lib/hiring-poster';
import type { CompanyCareerRef } from '@/lib/company-career';

export async function GET(request: NextRequest) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const forPrint = request.nextUrl.searchParams.get('print') === '1';

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      address: true,
      primaryColor: true,
      accentColor: true,
    },
  });

  if (!company) return notFound('Company not found');

  const jobs = await prisma.job.findMany({
    where: { companyId, status: 'Open' },
    select: { title: true, department: true, employmentType: true, salary: true },
    orderBy: { title: 'asc' },
  });

  if (jobs.length === 0) {
    return NextResponse.json({ error: 'No open positions' }, { status: 400 });
  }

  const companyRef: CompanyCareerRef = { id: company.id, slug: company.slug };
  const pdf = await generateHiringPosterPdf(
    {
      name: company.name,
      logoUrl: company.logoUrl,
      address: company.address,
      primaryColor: company.primaryColor,
      accentColor: company.accentColor,
    },
    companyRef,
    jobs
  );

  const slug = company.slug || `company-${company.id}`;
  const filename = `${slug}-hiring-poster.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${forPrint ? 'inline' : 'attachment'}; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
