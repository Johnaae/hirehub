import { NextRequest, NextResponse } from 'next/server';
import { getStoreConfig } from '@/lib/config';
import { getCompanyByCareerRef } from '@/lib/company';

export async function GET(request: NextRequest) {
  const companySlug = request.nextUrl.searchParams.get('company');
  if (!companySlug) {
    return NextResponse.json({ error: 'Company slug is required' }, { status: 400 });
  }

  const company = await getCompanyByCareerRef(companySlug);
  if (!company || company.status === 'suspended') {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const config = await getStoreConfig(company.id);
  return NextResponse.json(config);
}
