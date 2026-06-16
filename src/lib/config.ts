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
        description: company.description || company.careerPageBanner || '',
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
    companyId: DEFAULT_COMPANY_ID,
    companySlug: 'default',
    storeName: process.env.STORE_NAME || 'The UPS Store Hiring Portal',
    storeAddress: process.env.STORE_ADDRESS || '',
    storePhone: '',
    storeWebsite: '',
    ownerEmail: process.env.OWNER_EMAIL || '',
    primaryColor: process.env.PRIMARY_COLOR || '#351C15',
    accentColor: process.env.ACCENT_COLOR || '#FFB500',
    description: '',
    logoUrl: '',
    timezone: 'America/New_York',
    footer: '',
    socialLinks: {},
  };
}

export type StoreConfig = Awaited<ReturnType<typeof getStoreConfig>>;
