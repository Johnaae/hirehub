export const APPLICANT_SOURCES = ['website', 'qr', 'facebook', 'indeed', 'other'] as const;
export type ApplicantSource = (typeof APPLICANT_SOURCES)[number];

export const APPLICANT_SOURCE_LABELS: Record<ApplicantSource, string> = {
  website: 'Website',
  qr: 'QR',
  facebook: 'Facebook',
  indeed: 'Indeed',
  other: 'Other',
};

export function normalizeApplicantSource(raw?: string | null): ApplicantSource {
  if (!raw) return 'website';
  const value = raw.toLowerCase().trim();
  if (value === 'qr' || value === 'qrcode') return 'qr';
  if (value === 'facebook' || value === 'fb') return 'facebook';
  if (value === 'indeed') return 'indeed';
  if (value === 'website' || value === 'web') return 'website';
  if ((APPLICANT_SOURCES as readonly string[]).includes(value)) return value as ApplicantSource;
  return 'other';
}

export const APPLY_SOURCE_STORAGE_KEY = 'hirehub_apply_source';
