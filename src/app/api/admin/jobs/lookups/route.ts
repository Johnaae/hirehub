import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { tenantWhere } from '@/lib/tenant';
import { LOOKUP_CATEGORIES } from '@/lib/jobs';
import { z } from 'zod';

export async function GET() {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { industry: true },
  });
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const options = await prisma.jobLookupOption.findMany({
    where: tenantWhere(companyId),
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  });

  const grouped: Record<string, string[]> = {};
  for (const cat of LOOKUP_CATEGORIES) grouped[cat] = [];
  for (const opt of options) {
    if (!grouped[opt.category]) grouped[opt.category] = [];
    grouped[opt.category].push(opt.value);
  }

  return NextResponse.json({ lookups: grouped, industry: company.industry });
}

const addSchema = z.object({
  category: z.enum(['department', 'job_title', 'employment_type', 'salary_range', 'location', 'requirement', 'benefit']),
  value: z.string().trim().min(1).max(200),
});

export async function POST(request: NextRequest) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const body = await request.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }

  const { category, value } = parsed.data;

  const existing = await prisma.jobLookupOption.findUnique({
    where: { companyId_category_value: { companyId, category, value } },
  });
  if (existing) return NextResponse.json({ option: existing });

  const count = await prisma.jobLookupOption.count({ where: tenantWhere(companyId, { category }) });

  const option = await prisma.jobLookupOption.create({
    data: { companyId, category, value, sortOrder: count },
  });

  return NextResponse.json({ option }, { status: 201 });
}
