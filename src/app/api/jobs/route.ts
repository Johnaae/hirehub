import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DEFAULT_COMPANY_ID } from '@/lib/company';

export async function GET() {
  const jobs = await prisma.job.findMany({
    where: { companyId: DEFAULT_COMPANY_ID, status: 'Open' },
    select: {
      id: true,
      title: true,
      slug: true,
      department: true,
      employmentType: true,
      salary: true,
      location: true,
      description: true,
      requirements: true,
      benefits: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ jobs });
}
