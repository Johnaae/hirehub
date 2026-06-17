import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { notFound } from '@/lib/tenant';
import { getProductionOrigin } from '@/lib/app-url';
import {
  getCompanyQrCareerUrl,
  getShortCareerDisplayUrl,
  type CompanyCareerRef,
} from '@/lib/company-career';
import { generateQrDataUrl } from '@/lib/qr-code';

export async function GET() {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, slug: true, logoUrl: true, primaryColor: true },
  });

  if (!company) return notFound('Company not found');

  const companyRef: CompanyCareerRef = { id: company.id, slug: company.slug };
  const origin = getProductionOrigin();
  const careerUrl = getCompanyQrCareerUrl(companyRef, origin);
  const shortUrl = getShortCareerDisplayUrl(companyRef, origin);

  const jobs = await prisma.job.findMany({
    where: { companyId, status: 'Open' },
    select: { id: true, title: true, department: true, employmentType: true },
    orderBy: { title: 'asc' },
  });

  const qrDataUrl = await generateQrDataUrl(careerUrl);

  return NextResponse.json({
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logoUrl: company.logoUrl,
      primaryColor: company.primaryColor,
    },
    careerUrl,
    shortUrl,
    qrDataUrl,
    jobs,
  });
}
