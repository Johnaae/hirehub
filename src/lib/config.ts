import prisma from './prisma';
import { DEFAULT_COMPANY_ID } from './company';

export async function getStoreConfig() {
  try {
    const company = await prisma.company.findUnique({ where: { id: DEFAULT_COMPANY_ID } });
    if (company) {
      return {
        storeName: company.name,
        storeAddress: company.address || '',
        ownerEmail: company.email || process.env.OWNER_EMAIL || '',
        primaryColor: company.primaryColor,
        accentColor: company.accentColor,
        description: company.description || '',
        logoUrl: company.logoUrl || '',
      };
    }
  } catch {
    // DB may not be ready
  }

  return {
    storeName: process.env.STORE_NAME || 'The UPS Store Hiring Portal',
    storeAddress: process.env.STORE_ADDRESS || '',
    ownerEmail: process.env.OWNER_EMAIL || '',
    primaryColor: process.env.PRIMARY_COLOR || '#351C15',
    accentColor: process.env.ACCENT_COLOR || '#FFB500',
    description: '',
    logoUrl: '',
  };
}

export type StoreConfig = Awaited<ReturnType<typeof getStoreConfig>>;
