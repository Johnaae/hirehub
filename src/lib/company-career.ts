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

/**
 * Full career page URL. Pass `origin` on the server; on the client uses window.location.origin.
 */
export function getCompanyCareerUrl(company: CompanyCareerRef, origin?: string): string {
  const path = getCompanyCareerPath(company);
  if (origin) return `${origin.replace(/\/$/, '')}${path}`;
  if (typeof window !== 'undefined') return `${window.location.origin}${path}`;
  return path;
}

export function getCompanyQrCareerPath(company: CompanyCareerRef): string {
  return `${getCompanyCareerPath(company)}?source=qr`;
}

export function getCompanyQrCareerUrl(company: CompanyCareerRef, origin?: string): string {
  const base = origin
    ? `${origin.replace(/\/$/, '')}${getCompanyCareerPath(company)}`
    : getCompanyCareerUrl(company, origin);
  return `${base}?source=qr`;
}

export function getShortCareerDisplayUrl(company: CompanyCareerRef, origin: string): string {
  const segment = getCompanyCareerSegment(company);
  try {
    const host = new URL(origin).host;
    return `${host}/careers/${segment}`;
  } catch {
    return `/careers/${segment}`;
  }
}

export function isValidCompanySlugFormat(slug: string): boolean {
  return slug.length >= 2 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
