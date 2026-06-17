import { getPublicAppOrigin } from './app-url';

export interface CompanyCareerRef {
  slug?: string | null;
  id: number;
}

/** Career URL segment: prefer slug, fall back to numeric id. Never returns "default". */
export function getCompanyCareerSegment(company: CompanyCareerRef): string {
  const slug = company.slug?.trim();
  if (slug && slug !== 'default') return slug;
  return String(company.id);
}

export function getCompanyCareerPath(company: CompanyCareerRef): string {
  return `/careers/${getCompanyCareerSegment(company)}`;
}

export function getCompanyApplyPath(company: CompanyCareerRef, jobId: number): string {
  return `${getCompanyCareerPath(company)}/apply/${jobId}`;
}

function withPublicOrigin(path: string): string {
  const origin = getPublicAppOrigin();
  return origin ? `${origin}${path}` : path;
}

/** Full public career page URL (production domain when configured). */
export function getCompanyCareerUrl(company: CompanyCareerRef): string {
  return withPublicOrigin(getCompanyCareerPath(company));
}

export function getCompanyQrCareerPath(company: CompanyCareerRef): string {
  return `${getCompanyCareerPath(company)}?source=qr`;
}

/** Full public QR career URL: ${NEXT_PUBLIC_APP_URL}/careers/${slug}?source=qr */
export function getCompanyQrCareerUrl(company: CompanyCareerRef): string {
  return withPublicOrigin(getCompanyQrCareerPath(company));
}

/** Full public job apply URL. */
export function getCompanyApplyUrl(company: CompanyCareerRef, jobId: number): string {
  return withPublicOrigin(getCompanyApplyPath(company, jobId));
}

export function getShortCareerDisplayUrl(company: CompanyCareerRef): string {
  const segment = getCompanyCareerSegment(company);
  const origin = getPublicAppOrigin();
  if (origin) {
    try {
      const host = new URL(origin).host;
      return `${host}/careers/${segment}`;
    } catch {
      // fall through
    }
  }
  return `/careers/${segment}`;
}

export function isValidCompanySlugFormat(slug: string): boolean {
  return slug.length >= 2 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
