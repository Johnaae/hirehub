import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DEFAULT_COMPANY_ID } from '@/lib/company';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const company = await prisma.company.findUnique({
    where: { id: DEFAULT_COMPANY_ID },
    include: { settings: true },
  });

  return NextResponse.json({ company });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json();

  const company = await prisma.company.update({
    where: { id: DEFAULT_COMPANY_ID },
    data: {
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      description: body.description,
      logoUrl: body.logoUrl,
      primaryColor: body.primaryColor,
      accentColor: body.accentColor,
    },
    include: { settings: true },
  });

  if (body.settings) {
    await prisma.companySettings.upsert({
      where: { companyId: DEFAULT_COMPANY_ID },
      create: {
        companyId: DEFAULT_COMPANY_ID,
        ownerEmail: body.settings.ownerEmail,
        smtpHost: body.settings.smtpHost,
        smtpPort: body.settings.smtpPort ? parseInt(body.settings.smtpPort, 10) : null,
        smtpUser: body.settings.smtpUser,
        smtpPass: body.settings.smtpPass,
        uploadProvider: body.settings.uploadProvider || 'uploadthing',
      },
      update: {
        ownerEmail: body.settings.ownerEmail,
        smtpHost: body.settings.smtpHost,
        smtpPort: body.settings.smtpPort ? parseInt(body.settings.smtpPort, 10) : null,
        smtpUser: body.settings.smtpUser,
        smtpPass: body.settings.smtpPass,
        uploadProvider: body.settings.uploadProvider,
      },
    });
  }

  return NextResponse.json({ company });
}
