import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant, clearSession } from '@/lib/auth';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().trim().email('Invalid email format').max(255),
});

export async function PATCH(request: NextRequest) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { session } = auth;

  const body = await request.json();
  const parsed = emailSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.errors) {
      const key = issue.path[0];
      if (typeof key === 'string') fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  const newEmail = parsed.data.email.toLowerCase();

  if (newEmail === session.email.toLowerCase()) {
    return NextResponse.json({ error: 'This is already your login email' }, { status: 400 });
  }

  const duplicate = await prisma.admin.findUnique({ where: { email: newEmail } });
  if (duplicate) {
    return NextResponse.json({ error: 'Email already in use', fieldErrors: { email: 'Email already in use' } }, { status: 409 });
  }

  await prisma.admin.update({
    where: { id: session.id },
    data: { email: newEmail },
  });

  await clearSession();

  return NextResponse.json({
    message: 'Login email updated. Please sign in again with your new email.',
    requireLogin: true,
  });
}
