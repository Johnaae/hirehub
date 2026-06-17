import { NextResponse } from 'next/server';
import { clearSuperAdminSession, clearLegacySession } from '@/lib/auth';

export async function POST() {
  await clearSuperAdminSession();
  await clearLegacySession();
  return NextResponse.json({ message: 'Logged out successfully' });
}
