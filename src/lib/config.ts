import prisma from './prisma';
import { DEFAULT_COMPANY_ID } from './company';

export async function getStoreConfig(companyId: number = DEFAULT_COMPANY_ID) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { settings: true },
    });
    if (company) {
      return {
        companyId: company.id,
        companySlug: company.slug,
        storeName: company.name,
        storeAddress: company.address || '',
        storePhone: company.phone || '',
        storeWebsite: company.website || '',
        ownerEmail: company.ownerEmail || company.email || process.env.OWNER_EMAIL || '',
        primaryColor: company.primaryColor,
        accentColor: company.accentColor,
        heroTitle: company.careerPageBanner || `Join ${company.name}`,
        heroSubtitle: company.description || 'Explore open positions and apply today.',
        description: company.description || '',
        logoUrl: company.logoUrl || '',
        timezone: company.timezone,
        footer: company.footer || '',
        socialLinks: (company.socialLinks as Record<string, string>) || {},
      };
    }
  } catch {
    // DB may not be ready
  }

  return {
    companyId: 0,
    companySlug: '',
    storeName: 'HireHub',
    storeAddress: '',
    storePhone: '',
    storeWebsite: '',
    ownerEmail: '',
    primaryColor: '#1e3a5f',
    accentColor: '#3b82f6',
    heroTitle: 'Hiring portals for local businesses',
    heroSubtitle: '',
    description: '',
    logoUrl: '',
    timezone: 'America/New_York',
    footer: '',
    socialLinks: {},
  };
}

export type StoreConfig = Awaited<ReturnType<typeof getStoreConfig>>;
