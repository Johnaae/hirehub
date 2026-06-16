import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DEFAULT_COMPANY_ID } from '@/lib/company';
import { LOOKUP_CATEGORIES } from '@/lib/jobs';
import { z } from 'zod';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const options = await prisma.jobLookupOption.findMany({
    where: { companyId: DEFAULT_COMPANY_ID },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  });

  const grouped: Record<string, string[]> = {};
  for (const cat of LOOKUP_CATEGORIES) grouped[cat] = [];
  for (const opt of options) {
    if (!grouped[opt.category]) grouped[opt.category] = [];
    grouped[opt.category].push(opt.value);
  }

  return NextResponse.json({ lookups: grouped });
}

const addSchema = z.object({
  category: z.enum(['department', 'job_title', 'employment_type', 'salary_range', 'location', 'requirement', 'benefit']),
  value: z.string().trim().min(1).max(200),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }

  const { category, value } = parsed.data;

  const existing = await prisma.jobLookupOption.findUnique({
    where: { companyId_category_value: { companyId: DEFAULT_COMPANY_ID, category, value } },
  });
  if (existing) return NextResponse.json({ option: existing });

  const count = await prisma.jobLookupOption.count({ where: { companyId: DEFAULT_COMPANY_ID, category } });

  const option = await prisma.jobLookupOption.create({
    data: { companyId: DEFAULT_COMPANY_ID, category, value, sortOrder: count },
  });

  return NextResponse.json({ option }, { status: 201 });
}
