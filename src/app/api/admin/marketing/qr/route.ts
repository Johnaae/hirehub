import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { notFound } from '@/lib/tenant';
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

  const companyRef: CompanyCareerRef = { id: company.id, slug: company.slug };
  const careerUrl = getCompanyQrCareerUrl(companyRef);
  const shortUrl = getShortCareerDisplayUrl(companyRef);

  const jobs = await prisma.job.findMany({
    where: { companyId, status: 'Open' },
    select: { id: true, title: true, department: true, employmentType: true, salary: true },
    orderBy: { title: 'asc' },
  });

  const qrDataUrl = jobs.length > 0 ? await generateQrDataUrl(careerUrl) : null;

  return NextResponse.json({
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logoUrl: company.logoUrl,
      address: company.address,
      primaryColor: company.primaryColor,
      accentColor: company.accentColor,
    },
    careerUrl,
    shortUrl,
    qrDataUrl,
    jobs,
  });
}
