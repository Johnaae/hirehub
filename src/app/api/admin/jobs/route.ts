import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { tenantWhere } from '@/lib/tenant';
import { slugify } from '@/lib/company';
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
  status: z.enum(JOB_STATUSES).optional(),
  openings: z.number().int().positive().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search')?.trim();
  const status = searchParams.get('status');
  const department = searchParams.get('department');

  const where: Record<string, unknown> = tenantWhere(companyId);

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

  const [jobsRaw, statusCounts, hiredByJob, interviewsByJob] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { applicants: true } } },
    }),
    prisma.job.groupBy({
      by: ['status'],
      where: tenantWhere(companyId),
      _count: { status: true },
    }),
    prisma.applicant.groupBy({
      by: ['jobId'],
      where: { companyId, status: 'Hired', jobId: { not: null } },
      _count: { jobId: true },
    }),
    prisma.interview.groupBy({
      by: ['applicantId'],
      where: { companyId },
      _count: { applicantId: true },
    }),
  ]);

  const hiredMap = new Map(hiredByJob.map((h) => [h.jobId, h._count.jobId]));
  const applicantJobIds = await prisma.applicant.findMany({
    where: { companyId, jobId: { in: jobsRaw.map((j) => j.id) } },
    select: { id: true, jobId: true },
  });
  const interviewCountByJob = new Map<number, number>();
  const applicantToJob = new Map(applicantJobIds.map((a) => [a.id, a.jobId]));
  for (const row of interviewsByJob) {
    const jobId = applicantToJob.get(row.applicantId);
    if (jobId) {
      interviewCountByJob.set(jobId, (interviewCountByJob.get(jobId) || 0) + row._count.applicantId);
    }
  }

  const jobs = jobsRaw.map((job) => {
    const hired = hiredMap.get(job.id) || 0;
    return {
      ...job,
      hiredCount: hired,
      interviewCount: interviewCountByJob.get(job.id) || 0,
      remainingOpenings: Math.max(0, job.openings - hired),
    };
  });

  const stats: Record<string, number> = {
    Open: 0,
    Closed: 0,
    Draft: 0,
    Archived: 0,
    Paused: 0,
    Filled: 0,
    Total: 0,
  };
  for (const s of statusCounts) {
    stats[s.status] = s._count.status;
    stats.Total += s._count.status;
  }

  return NextResponse.json({ jobs, stats });
}

export async function POST(request: NextRequest) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const body = await request.json();
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.errors }, { status: 400 });
  }

  const data = parsed.data;
  let slug = slugify(data.title);
  const existing = await prisma.job.findFirst({ where: tenantWhere(companyId, { slug }) });
  if (existing) slug = `${slug}-${Date.now()}`;

  const job = await prisma.job.create({
    data: {
      companyId,
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
      openings: data.openings ?? 1,
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
