import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import {
  signAdminToken,
  verifyPassword,
  getAuthCookieOptions,
  COOKIE_NAME,
} from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import type { AdminRole } from '@/lib/tenant';

export async function POST(request: NextRequest) {
  const rl = rateLimit(`login:${getClientIp(request)}`, 10, 900_000);
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
      include: { company: { select: { id: true, name: true, slug: true, status: true } } },
    });

    if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const role = admin.role as AdminRole;

    if (admin.company.status === 'suspended' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Your company account has been suspended', suspended: true }, { status: 403 });
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await signAdminToken({
      id: admin.id,
      email: admin.email,
      companyId: admin.companyId,
      role,
      impersonateCompanyId: null,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, getAuthCookieOptions());

    const redirectTo = role === 'SUPER_ADMIN' ? '/super-admin' : '/admin';

    return NextResponse.json({
      message: 'Login successful',
      redirectTo,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role,
        companyId: admin.companyId,
        company: admin.company,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
