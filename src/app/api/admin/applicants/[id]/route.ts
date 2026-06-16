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

    const applicant = await prisma.applicant.findUnique({ where: { id: applicantId } });
    if (!applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }

    return NextResponse.json({ applicant });
  } catch (err) {
    console.error('Fetch applicant error:', err);
    return NextResponse.json({ error: 'Failed to fetch applicant' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

    const deleted = await prisma.applicant.delete({ where: { id: applicantId } });
    return NextResponse.json({ message: 'Applicant deleted successfully', id: deleted.id });
  } catch (err) {
    console.error('Delete applicant error:', err);
    return NextResponse.json({ error: 'Failed to delete applicant' }, { status: 500 });
  }
}
