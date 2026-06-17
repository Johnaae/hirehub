import prisma from './prisma';
import { getOwnerNotificationEmail } from './notification-email';

export interface SharedSmtpTransport {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
  fromEmail: string;
}

export interface CompanyEmailContext {
  companyId: number;
  companyName: string;
  logoUrl: string;
  contactEmail: string | null;
  replyTo: string | null;
  primaryColor: string;
  accentColor: string;
}

/** Shared HireHub SMTP — the only active transport (per-company SMTP disabled for now). */
export function isSharedSmtpConfigured(): boolean {
  return !!(
    process.env.DEFAULT_SMTP_HOST &&
    process.env.DEFAULT_SMTP_PORT &&
    process.env.DEFAULT_SMTP_USER &&
    process.env.DEFAULT_SMTP_PASS &&
    process.env.DEFAULT_FROM_EMAIL
  );
}

export function getSharedSmtpTransport(): SharedSmtpTransport | null {
  if (!isSharedSmtpConfigured()) return null;

  const port = parseInt(process.env.DEFAULT_SMTP_PORT!, 10);
  const secure =
    process.env.DEFAULT_SMTP_SECURE === 'true' ||
    process.env.DEFAULT_SMTP_SECURE === '1' ||
    port === 465;

  return {
    host: process.env.DEFAULT_SMTP_HOST!,
    port,
    user: process.env.DEFAULT_SMTP_USER!,
    pass: process.env.DEFAULT_SMTP_PASS!,
    secure,
    fromEmail: process.env.DEFAULT_FROM_EMAIL!,
  };
}

export function formatHireHubFromAddress(companyName: string): string {
  const name = `${companyName} via HireHub`.replace(/"/g, "'");
  return `"${name}" <${process.env.DEFAULT_FROM_EMAIL!}>`;
}

export async function getCompanyReplyTo(companyId: number): Promise<string | null> {
  const [company, settings] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: { email: true, ownerEmail: true },
    }),
    prisma.companySettings.findUnique({
      where: { companyId },
      select: { ownerEmail: true },
    }),
  ]);

  if (company?.email?.trim()) return company.email.trim();
  if (settings?.ownerEmail?.trim()) return settings.ownerEmail.trim();
  if (company?.ownerEmail?.trim()) return company.ownerEmail.trim();

  return getOwnerNotificationEmail(companyId);
}

export async function getCompanyEmailContext(companyId: number): Promise<CompanyEmailContext> {
  const [company, replyTo] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        email: true,
        logoUrl: true,
        primaryColor: true,
        accentColor: true,
      },
    }),
    getCompanyReplyTo(companyId),
  ]);

  return {
    companyId,
    companyName: company?.name || 'HireHub',
    logoUrl: company?.logoUrl || '',
    contactEmail: company?.email?.trim() || replyTo,
    replyTo,
    primaryColor: company?.primaryColor || '#1e3a5f',
    accentColor: company?.accentColor || '#3b82f6',
  };
}

// Legacy aliases — per-company SMTP kept for future use but not active.
export const isFallbackSmtpAvailable = isSharedSmtpConfigured;
export function isCompanySmtpConfigured(): boolean {
  return false;
}
