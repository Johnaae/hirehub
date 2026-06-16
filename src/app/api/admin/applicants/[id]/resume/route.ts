import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const applicantId = parseInt(id, 10);
    if (isNaN(applicantId)) {
      return NextResponse.json({ error: 'Invalid applicant ID' }, { status: 400 });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
      select: { resumeUrl: true, resumeFilename: true },
    });

    if (!applicant?.resumeUrl) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.redirect(applicant.resumeUrl);
  } catch (err) {
    console.error('Resume download error:', err);
    return NextResponse.json({ error: 'Failed to download resume' }, { status: 500 });
  }
}
