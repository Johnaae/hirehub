import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/tenant';
import { createCompanyWithOwner, getCompanyStats } from '@/lib/company-service';
import { z } from 'zod';

export async function GET() {
  const auth = await requireSuperAdmin();
  if ('error' in auth) return auth.error;

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { applicants: true, jobs: true, admins: true } },
    },
  });

  const enriched = await Promise.all(
    companies.map(async (c) => ({
      ...c,
      stats: await getCompanyStats(c.id),
    }))
  );

  return NextResponse.json({ companies: enriched });
}

const createSchema = z.object({
  name: z.string().min(1).max(200),
  ownerName: z.string().min(1).max(120),
  ownerEmail: z.string().email(),
  temporaryPassword: z.string().min(8),
  industry: z.enum([
    'SHIPPING_RETAIL',
    'NAIL_SALON',
    'RESTAURANT',
    'ROOFING',
    'RETAIL',
    'FACTORY',
    'MEDICAL_OFFICE',
    'CUSTOM',
  ]),
  logoUrl: z.string().url().optional().nullable().or(z.literal('')),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  timezone: z.string().optional(),
  slug: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if ('error' in auth) return auth.error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.errors }, { status: 400 });
  }

  try {
    const company = await createCompanyWithOwner({
      ...parsed.data,
      logoUrl: parsed.data.logoUrl || null,
    });
    return NextResponse.json({ company }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create company';
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
