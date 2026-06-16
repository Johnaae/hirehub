import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, clearSession, verifyPassword, hashPassword } from '@/lib/auth';
import { z } from 'zod';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password confirmation does not match',
    path: ['confirmPassword'],
  });

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json();
  const parsed = passwordSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.errors) {
      const key = issue.path[0];
      if (typeof key === 'string') fieldErrors[key] = issue.message;
    }
    const firstError = parsed.error.errors[0]?.message || 'Validation failed';
    return NextResponse.json({ error: firstError, fieldErrors }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { id: session.id } });
  if (!admin) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const valid = await verifyPassword(currentPassword, admin.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: 'Invalid current password', fieldErrors: { currentPassword: 'Invalid current password' } },
      { status: 401 }
    );
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: 'New password must be different from current password', fieldErrors: { newPassword: 'Choose a different password' } },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.admin.update({
    where: { id: session.id },
    data: { passwordHash },
  });

  await clearSession();

  return NextResponse.json({
    message: 'Password updated. Please sign in again with your new password.',
    requireLogin: true,
  });
}
