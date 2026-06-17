import prisma from './prisma';
import { isValidCompanySlugFormat } from './company-career';

export { getCompanyCareerPath, getCompanyCareerUrl, getCompanyApplyPath, isValidCompanySlugFormat } from './company-career';
export type { CompanyCareerRef } from './company-career';

export async function getCompanyByCareerRef(ref: string) {
  if (!ref) return null;

  const bySlug = await prisma.company.findUnique({
    where: { slug: ref },
    include: { settings: true },
  });
  if (bySlug) return bySlug;

  const id = parseInt(ref, 10);
  if (!isNaN(id)) {
    return prisma.company.findUnique({
      where: { id },
      include: { settings: true },
    });
  }

  return null;
}

/** @deprecated use getCompanyByCareerRef */
export async function getCompanyBySlug(slug: string) {
  return getCompanyByCareerRef(slug);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateCompanySlug(slug: string): { ok: true; slug: string } | { ok: false; error: string } {
  const normalized = slugify(slug);
  if (!normalized) {
    return { ok: false, error: 'Slug is required' };
  }
  if (normalized === 'default') {
    return { ok: false, error: 'Slug "default" is not allowed' };
  }
  if (!isValidCompanySlugFormat(normalized)) {
    return {
      ok: false,
      error: 'Slug must be lowercase letters, numbers, and hyphens only (no spaces)',
    };
  }
  return { ok: true, slug: normalized };
}
