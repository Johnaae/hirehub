import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { notFound } from '@/lib/tenant';
import { getProductionOrigin } from '@/lib/app-url';
import { getCompanyQrCareerUrl, type CompanyCareerRef } from '@/lib/company-career';
import { generateQrPngBuffer } from '@/lib/qr-code';

export async function GET() {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, slug: true },
  });

  if (!company) return notFound('Company not found');

  const companyRef: CompanyCareerRef = { id: company.id, slug: company.slug };
  const careerUrl = getCompanyQrCareerUrl(companyRef, getProductionOrigin());
  const png = await generateQrPngBuffer(careerUrl);
  const slug = company.slug || `company-${company.id}`;
  const filename = `${slug}-qr-code.png`;

  return new NextResponse(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
