import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().min(1).max(120),
  title: z.string().min(1),
  department: z.string().optional().nullable(),
  employmentType: z.string().min(1),
  salaryRange: z.string().optional().nullable(),
  locationType: z.string().optional().nullable(),
  description: z.string().min(1),
  requirements: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
});

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

  const templates = await prisma.jobTemplate.findMany({
    where: {
      OR: [
        {
          isSystemTemplate: true,
          companyId: null,
          industry: company.industry,
        },
        {
          isSystemTemplate: false,
          companyId,
        },
      ],
    },
    orderBy: [{ isSystemTemplate: 'desc' }, { name: 'asc' }],
  });

  return NextResponse.json({ templates, industry: company.industry });
}

export async function POST(request: NextRequest) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const body = await request.json();
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.errors }, { status: 400 });
  }

  const data = parsed.data;

  const existing = await prisma.jobTemplate.findFirst({
    where: { companyId, name: data.name, isSystemTemplate: false },
  });
  if (existing) {
    return NextResponse.json({ error: 'A template with this name already exists' }, { status: 409 });
  }

  const template = await prisma.jobTemplate.create({
    data: {
      companyId,
      isSystemTemplate: false,
      ...data,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
