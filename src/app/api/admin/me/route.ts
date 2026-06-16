import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json({ admin: admin || session });
}
