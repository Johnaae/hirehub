import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { slugify, DEFAULT_COMPANY_ID } from '@/lib/company';
import { z } from 'zod';

const jobSchema = z.object({
  title: z.string().min(1),
  department: z.string().optional().nullable(),
  employmentType: z.string().min(1),
  salary: z.string().optional().nullable(),
  description: z.string().min(1),
  requirements: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  status: z.enum(['Open', 'Closed']).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const jobs = await prisma.job.findMany({
    where: { companyId: DEFAULT_COMPANY_ID },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { applicants: true } } },
  });

  return NextResponse.json({ jobs });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json();
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.errors }, { status: 400 });
  }

  const data = parsed.data;
  let slug = slugify(data.title);
  const existing = await prisma.job.findFirst({ where: { companyId: DEFAULT_COMPANY_ID, slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const job = await prisma.job.create({
    data: {
      companyId: DEFAULT_COMPANY_ID,
      slug,
      title: data.title,
      department: data.department,
      employmentType: data.employmentType,
      salary: data.salary,
      description: data.description,
      requirements: data.requirements,
      benefits: data.benefits,
      location: data.location,
      status: data.status || 'Open',
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
