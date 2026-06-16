import { NextRequest, NextResponse } from 'next/server';
import { getStoreConfig } from '@/lib/config';
import { getCompanyBySlug, DEFAULT_COMPANY_ID } from '@/lib/company';

export async function GET(request: NextRequest) {
  const companySlug = request.nextUrl.searchParams.get('company');
  let companyId = DEFAULT_COMPANY_ID;

  if (companySlug) {
    const company = await getCompanyBySlug(companySlug);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    companyId = company.id;
  }

  const config = await getStoreConfig(companyId);
  return NextResponse.json(config);
}
