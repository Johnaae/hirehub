import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DEFAULT_COMPANY_ID } from '@/lib/company';
import { startOfMonth, startOfDay, subDays } from 'date-fns';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const companyId = DEFAULT_COMPANY_ID;
    const now = new Date();
    const monthStart = startOfMonth(now);
    const todayStart = startOfDay(now);

    const [
      total,
      statusCounts,
      monthApplicants,
      positionCounts,
      recentApplicants,
      upcomingInterviews,
      recentHires,
      recentActivity,
      todayNew,
    ] = await Promise.all([
      prisma.applicant.count({ where: { companyId } }),
      prisma.applicant.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { status: true },
      }),
      prisma.applicant.findMany({
        where: { companyId, createdAt: { gte: monthStart } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.applicant.groupBy({
        by: ['position'],
        where: { companyId },
        _count: { position: true },
        orderBy: { _count: { position: 'desc' } },
        take: 8,
      }),
      prisma.applicant.findMany({
        where: { companyId },
        select: {
          id: true, firstName: true, lastName: true, position: true,
          status: true, createdAt: true, email: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.interview.findMany({
        where: { companyId, scheduledAt: { gte: now }, status: 'Scheduled' },
        include: {
          applicant: { select: { firstName: true, lastName: true, position: true } },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),
      prisma.applicant.findMany({
        where: { companyId, status: 'Hired' },
        select: { id: true, firstName: true, lastName: true, position: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.activityLog.findMany({
        where: { companyId },
        include: {
          admin: { select: { email: true, name: true } },
          applicant: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.applicant.count({
        where: { companyId, createdAt: { gte: todayStart } },
      }),
    ]);

    const stats: Record<string, number> = {
      Total: total,
      New: 0,
      Reviewing: 0,
      Interview: 0,
      Hired: 0,
      Rejected: 0,
    };
    for (const s of statusCounts) {
      stats[s.status] = s._count.status;
    }

    const dailyMap: Record<string, number> = {};
    for (const a of monthApplicants) {
      const key = a.createdAt.toISOString().split('T')[0];
      dailyMap[key] = (dailyMap[key] || 0) + 1;
    }
    const applicantsByDay = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      stats,
      todayNew,
      applicantsByDay,
      applicantsByStatus: statusCounts.map((s) => ({ status: s.status, count: s._count.status })),
      applicantsByPosition: positionCounts.map((p) => ({ position: p.position, count: p._count.position })),
      recentApplicants,
      upcomingInterviews,
      recentHires,
      recentActivity,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
