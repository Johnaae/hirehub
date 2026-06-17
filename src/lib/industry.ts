export const COMPANY_INDUSTRIES = [
  'SHIPPING_RETAIL',
  'NAIL_SALON',
  'RESTAURANT',
  'ROOFING',
  'RETAIL',
  'FACTORY',
  'MEDICAL_OFFICE',
  'CUSTOM',
] as const;

export type CompanyIndustry = (typeof COMPANY_INDUSTRIES)[number];

export const INDUSTRY_LABELS: Record<CompanyIndustry, string> = {
  SHIPPING_RETAIL: 'Shipping & Print Retail (UPS Store, FedEx, etc.)',
  NAIL_SALON: 'Nail Salon & Spa',
  RESTAURANT: 'Restaurant & Food Service',
  ROOFING: 'Roofing & Construction',
  RETAIL: 'General Retail',
  FACTORY: 'Factory & Manufacturing',
  MEDICAL_OFFICE: 'Medical Office',
  CUSTOM: 'Custom / Other',
};

export function isValidIndustry(value: string): value is CompanyIndustry {
  return (COMPANY_INDUSTRIES as readonly string[]).includes(value);
}
