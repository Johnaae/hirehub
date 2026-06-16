import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const jobSchema = z.object({
  title: z.string().min(1).optional(),
  department: z.string().optional().nullable(),
  employmentType: z.string().optional(),
  salary: z.string().optional().nullable(),
  description: z.string().optional(),
  requirements: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  status: z.enum(['Open', 'Closed']).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id: parseInt(id, 10) },
    include: { _count: { select: { applicants: true } } },
  });
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  return NextResponse.json({ job });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  const jobId = parseInt(id, 10);
  const body = await request.json();
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }

  const job = await prisma.job.update({
    where: { id: jobId },
    data: parsed.data,
  });
  return NextResponse.json({ job });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  await prisma.job.delete({ where: { id: parseInt(id, 10) } });
  return NextResponse.json({ message: 'Job deleted' });
}
