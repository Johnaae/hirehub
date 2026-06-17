import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSuperAdmin } from '@/lib/tenant';
import { isSharedSmtpConfigured, sendPlatformTestEmail } from '@/lib/email';

export async function GET() {
  const auth = await requireSuperAdmin();
  if ('error' in auth) return auth.error;

  return NextResponse.json({
    emailConfigured: isSharedSmtpConfigured(),
    fromEmail: process.env.DEFAULT_FROM_EMAIL || null,
  });
}

const testSchema = z.object({
  to: z.string().email(),
  sampleCompanyName: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if ('error' in auth) return auth.error;

  const body = await request.json().catch(() => ({}));
  const parsed = testSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Valid recipient email is required' }, { status: 400 });
  }

  const result = await sendPlatformTestEmail(
    parsed.data.to,
    parsed.data.sampleCompanyName || 'HireHub Demo Company'
  );

  if (!result.sent) {
    return NextResponse.json(result, { status: result.emailStatus === 'not_configured' ? 400 : 502 });
  }

  return NextResponse.json({ ...result, to: parsed.data.to });
}
