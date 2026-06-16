export function getStoreConfig() {
  return {
    storeName: process.env.STORE_NAME || 'The UPS Store Hiring Portal',
    storeAddress: process.env.STORE_ADDRESS || '',
    ownerEmail: process.env.OWNER_EMAIL || '',
    primaryColor: process.env.PRIMARY_COLOR || '#351C15',
    accentColor: process.env.ACCENT_COLOR || '#FFB500',
  };
}

export type StoreConfig = ReturnType<typeof getStoreConfig>;
