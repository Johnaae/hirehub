import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { STATUSES } from '@/lib/constants';
import { DEFAULT_COMPANY_ID } from '@/lib/company';

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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(10, parseInt(searchParams.get('limit') || '15', 10)));
    const skip = (page - 1) * limit;

    if (status && !STATUSES.includes(status as (typeof STATUSES)[number])) {
      return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
    }

    const where: Record<string, unknown> = { companyId: DEFAULT_COMPANY_ID };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { position: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (position) where.position = position;

    const [applicants, total] = await Promise.all([
      prisma.applicant.findMany({
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
          resumeFilename: true,
          resumeUrl: true,
        },
        orderBy: { createdAt: sort === 'oldest' ? 'asc' : 'desc' },
        skip,
        take: limit,
      }),
      prisma.applicant.count({ where }),
    ]);

    const positions = await prisma.applicant.findMany({
      where: { companyId: DEFAULT_COMPANY_ID },
      select: { position: true },
      distinct: ['position'],
    });

    return NextResponse.json({
      applicants,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      positions: positions.map((p) => p.position),
    });
  } catch (err) {
    console.error('Fetch applicants error:', err);
    return NextResponse.json({ error: 'Failed to fetch applicants' }, { status: 500 });
  }
}
