import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Owner name is required').max(120).optional(),
  notificationEmail: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : val),
    z.string().email('Invalid notification email format').max(255).nullable().optional()
  ),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const admin = await prisma.admin.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      notificationEmail: true,
      createdAt: true,
      lastLoginAt: true,
      updatedAt: true,
    },
  });

  if (!admin) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  return NextResponse.json({ admin });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.errors) {
      const key = issue.path[0];
      if (typeof key === 'string') fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  const { name, notificationEmail } = parsed.data;
  const data: { name?: string; notificationEmail?: string | null } = {};

  if (name !== undefined) data.name = name;
  if (notificationEmail !== undefined) {
    data.notificationEmail = notificationEmail ? notificationEmail.toLowerCase() : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const admin = await prisma.admin.update({
    where: { id: session.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      notificationEmail: true,
      createdAt: true,
      lastLoginAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ admin, message: 'Account updated' });
}
