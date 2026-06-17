import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  verifyPassword,
  setSuperAdminSession,
  clearLegacySession,
} from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rl = rateLimit(`super-login:${getClientIp(request)}`, 10, 900_000);
  if (!rl.ok) return rl.response;

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin || admin.role !== 'SUPER_ADMIN' || !(await verifyPassword(password, admin.passwordHash))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    await clearLegacySession();

    await setSuperAdminSession({
      id: admin.id,
      email: admin.email,
      companyId: admin.companyId,
      role: 'SUPER_ADMIN',
      impersonateCompanyId: null,
    });

    return NextResponse.json({
      message: 'Login successful',
      redirectTo: '/super-admin',
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (err) {
    console.error('Super admin login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
