import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { notFound } from '@/lib/tenant';

export async function GET() {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { settings: true },
  });

  if (!company) return notFound('Company not found');

  return NextResponse.json({ company });
}

export async function PATCH(request: Request) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const body = await request.json();

  const company = await prisma.company.update({
    where: { id: companyId },
    data: {
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
      description: body.description,
      logoUrl: body.logoUrl,
      primaryColor: body.primaryColor,
      accentColor: body.accentColor,
      timezone: body.timezone,
      careerPageBanner: body.careerPageBanner,
      footer: body.footer,
      socialLinks: body.socialLinks,
    },
    include: { settings: true },
  });

  if (body.settings) {
    const settingsData = {
      smtpHost: body.settings.smtpHost,
      smtpPort: body.settings.smtpPort ? parseInt(body.settings.smtpPort, 10) : null,
      smtpUser: body.settings.smtpUser,
      smtpPass: body.settings.smtpPass,
      uploadProvider: body.settings.uploadProvider || 'uploadthing',
      ...(body.settings.ownerEmail !== undefined && { ownerEmail: body.settings.ownerEmail }),
    };

    await prisma.companySettings.upsert({
      where: { companyId },
      create: {
        companyId,
        ...settingsData,
      },
      update: settingsData,
    });
  }

  return NextResponse.json({ company });
}
