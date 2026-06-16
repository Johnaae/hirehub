import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { slugify, DEFAULT_COMPANY_ID } from '@/lib/company';
import { JOB_STATUSES } from '@/lib/jobs';
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
  status: z.enum(['Open', 'Closed', 'Draft', 'Archived']).optional(),
});

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search')?.trim();
  const status = searchParams.get('status');
  const department = searchParams.get('department');

  const where: Record<string, unknown> = { companyId: DEFAULT_COMPANY_ID };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { department: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status && JOB_STATUSES.includes(status as (typeof JOB_STATUSES)[number])) {
    where.status = status;
  }
  if (department) where.department = department;

  const [jobs, statusCounts] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { applicants: true } } },
    }),
    prisma.job.groupBy({
      by: ['status'],
      where: { companyId: DEFAULT_COMPANY_ID },
      _count: { status: true },
    }),
  ]);

  const stats: Record<string, number> = { Open: 0, Closed: 0, Draft: 0, Archived: 0, Total: 0 };
  for (const s of statusCounts) {
    stats[s.status] = s._count.status;
    stats.Total += s._count.status;
  }

  return NextResponse.json({ jobs, stats });
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
      status: data.status || 'Draft',
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
