import prisma from './prisma';

export const DEFAULT_COMPANY_ID = 1;

export async function getDefaultCompany() {
  return prisma.company.findUnique({
    where: { id: DEFAULT_COMPANY_ID },
    include: { settings: true },
  });
}

export async function getCompanyBySlug(slug: string) {
  return prisma.company.findUnique({
    where: { slug },
    include: { settings: true },
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
