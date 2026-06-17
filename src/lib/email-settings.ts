import type { CompanySettings } from '@prisma/client';
import { isSharedSmtpConfigured } from './company-smtp';

export type PublicEmailSettings = {
  uploadProvider: string;
  ownerEmail: string | null;
  /** Platform shared SMTP is configured (same for all companies). */
  emailConfigured: boolean;
  sharedSmtpConfigured: boolean;
};

export function toPublicEmailSettings(
  settings: CompanySettings | null | undefined
): PublicEmailSettings {
  const sharedSmtpConfigured = isSharedSmtpConfigured();

  return {
    uploadProvider: settings?.uploadProvider || 'uploadthing',
    ownerEmail: settings?.ownerEmail || null,
    emailConfigured: sharedSmtpConfigured,
    sharedSmtpConfigured,
  };
}

export function sanitizeCompanyResponse<T extends { settings?: CompanySettings | null }>(
  company: T
): Omit<T, 'settings'> & { settings: PublicEmailSettings | null } {
  const { settings, ...rest } = company;
  return {
    ...rest,
    settings: settings ? toPublicEmailSettings(settings) : toPublicEmailSettings(null),
  };
}
