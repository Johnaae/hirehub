import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { STATUSES } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status');
    const position = searchParams.get('position');
    const sort = searchParams.get('sort') || 'newest';

    if (status && !STATUSES.includes(status as (typeof STATUSES)[number])) {
      return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
    }

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (position) where.position = position;

    const applicants = await prisma.applicant.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        position: true,
        employmentType: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: sort === 'oldest' ? 'asc' : 'desc' },
    });

    return NextResponse.json({ applicants });
  } catch (err) {
    console.error('Fetch applicants error:', err);
    return NextResponse.json({ error: 'Failed to fetch applicants' }, { status: 500 });
  }
}
