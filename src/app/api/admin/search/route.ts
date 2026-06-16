import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DEFAULT_COMPANY_ID } from '@/lib/company';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const applicants = await prisma.applicant.findMany({
    where: {
      companyId: DEFAULT_COMPANY_ID,
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { position: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      phone: true, position: true, status: true,
    },
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ results: applicants });
}
