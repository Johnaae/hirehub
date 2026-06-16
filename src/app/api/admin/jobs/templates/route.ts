import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DEFAULT_COMPANY_ID } from '@/lib/company';
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().min(1).max(120),
  title: z.string().min(1),
  department: z.string().optional().nullable(),
  employmentType: z.string().min(1),
  salary: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  description: z.string().min(1),
  requirements: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const templates = await prisma.jobTemplate.findMany({
    where: { companyId: DEFAULT_COMPANY_ID },
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
  });

  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json();
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.errors }, { status: 400 });
  }

  const data = parsed.data;

  const existing = await prisma.jobTemplate.findUnique({
    where: { companyId_name: { companyId: DEFAULT_COMPANY_ID, name: data.name } },
  });
  if (existing) {
    return NextResponse.json({ error: 'A template with this name already exists' }, { status: 409 });
  }

  const template = await prisma.jobTemplate.create({
    data: {
      companyId: DEFAULT_COMPANY_ID,
      isSystem: false,
      ...data,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
