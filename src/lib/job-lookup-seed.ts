import type { CompanyIndustry } from './industry';

export type LookupSeedData = {
  department: readonly string[];
  job_title: readonly string[];
  employment_type: readonly string[];
  salary_range: readonly string[];
  location: readonly string[];
  requirement: readonly string[];
  benefit: readonly string[];
};

const EMPLOYMENT_TYPES = [
  'Full-Time',
  'Part-Time',
  'Seasonal',
  'Contract',
  'Temporary',
  'Either',
] as const;

const COMMON_REQ = [
  'Must be authorized to work in the United States',
  'Reliable and punctual',
  'Friendly and professional attitude',
] as const;

const COMMON_BEN = [
  'Competitive pay',
  'Paid training',
  'Team-oriented environment',
  'Growth and advancement opportunities',
] as const;

export const LOOKUPS_BY_INDUSTRY: Record<CompanyIndustry, LookupSeedData> = {
  SHIPPING_RETAIL: {
    department: ['Customer Service', 'Shipping & Print', 'Sales', 'Operations', 'Management'],
    job_title: [
      'Customer Service Associate',
      'Print & Shipping Associate',
      'Retail Sales Associate',
      'Notary Associate',
      'Shift Supervisor',
      'Assistant Manager',
      'Store Manager',
    ],
    employment_type: EMPLOYMENT_TYPES,
    salary_range: [
      '$12 – $14/hr',
      '$14 – $16/hr',
      '$16 – $18/hr',
      '$18 – $22/hr',
      '$45,000 – $55,000/year',
      '$55,000 – $70,000/year',
      'Competitive — DOE',
    ],
    location: ['On-site', 'In-store', 'Store Location'],
    requirement: [
      ...COMMON_REQ,
      'Basic computer skills',
      'Customer service experience preferred',
      'Cash handling experience',
      'POS system experience',
      'Shipping and packing experience',
      'Printing and document services experience',
      'Notary commission (or willing to obtain)',
      'Ability to lift up to 50 lbs',
      'Leadership or supervisory experience',
      'Flexible schedule including weekends',
    ],
    benefit: [
      ...COMMON_BEN,
      'Flexible scheduling',
      'Employee discounts',
      'Performance bonuses',
      'Health insurance (full-time)',
      'Paid time off',
      '401(k) retirement plan',
    ],
  },
  NAIL_SALON: {
    department: ['Service', 'Front Desk', 'Management', 'Spa Services'],
    job_title: [
      'Nail Technician',
      'Receptionist',
      'Salon Manager',
      'Lash Technician',
      'Esthetician',
      'Spa Coordinator',
    ],
    employment_type: EMPLOYMENT_TYPES,
    salary_range: [
      '$12 – $14/hr',
      '$14 – $16/hr',
      '$16 – $18/hr',
      '$18 – $22/hr',
      '$22 – $28/hr',
      '$45,000 – $55,000/year',
      'Competitive — DOE',
    ],
    location: ['On-site', 'In-salon'],
    requirement: [
      ...COMMON_REQ,
      'State nail technician license (or willing to obtain)',
      'Lash certification (or willing to obtain)',
      'Esthetician license (or willing to obtain)',
      'Customer service experience preferred',
      'Basic computer skills',
      'Cash handling experience',
      'Attention to detail',
      'Ability to stand for extended periods',
      'Leadership or supervisory experience',
    ],
    benefit: [
      ...COMMON_BEN,
      'Tips (where applicable)',
      'Flexible scheduling',
      'Employee discounts',
      'Health insurance (full-time)',
      'Performance bonuses',
    ],
  },
  RESTAURANT: {
    department: ['Kitchen', 'Front of House', 'Management'],
    job_title: ['Cook', 'Server', 'Dishwasher', 'Kitchen Manager'],
    employment_type: EMPLOYMENT_TYPES,
    salary_range: [
      '$12 – $14/hr',
      '$14 – $16/hr',
      '$16 – $20/hr',
      '$18 – $22/hr',
      '$45,000 – $55,000/year',
      'Competitive — DOE',
    ],
    location: ['On-site', 'In-restaurant'],
    requirement: [
      ...COMMON_REQ,
      'Food handler certification (or willing to obtain)',
      'Kitchen experience preferred',
      'Customer service experience preferred',
      'Ability to stand for extended periods',
      'Ability to work in a fast-paced environment',
      'Flexible schedule including weekends',
      'Leadership or supervisory experience',
    ],
    benefit: [
      ...COMMON_BEN,
      'Tips (where applicable)',
      'Meal discounts',
      'Flexible scheduling',
      'Health insurance (full-time)',
      'Paid time off',
    ],
  },
  ROOFING: {
    department: ['Field Operations', 'Sales', 'Management', 'Administration'],
    job_title: ['Roofer', 'Project Manager', 'Estimator', 'Sales Representative'],
    employment_type: EMPLOYMENT_TYPES,
    salary_range: [
      '$16 – $18/hr',
      '$18 – $22/hr',
      '$22 – $28/hr',
      '$45,000 – $55,000/year',
      '$55,000 – $70,000/year',
      'Competitive — DOE',
    ],
    location: ['On-site', 'Field', 'Hybrid'],
    requirement: [
      ...COMMON_REQ,
      'Ability to lift up to 50 lbs',
      'Comfort working at heights',
      'Valid driver\'s license',
      'OSHA safety training preferred',
      'Roofing or construction experience preferred',
      'Sales experience preferred',
      'Leadership or supervisory experience',
      'Strong communication skills',
    ],
    benefit: [
      ...COMMON_BEN,
      'Overtime opportunities',
      'Performance bonuses',
      'Company vehicle or mileage reimbursement',
      'Health insurance (full-time)',
      'Paid time off',
    ],
  },
  RETAIL: {
    department: ['Sales', 'Operations', 'Management'],
    job_title: [
      'Retail Sales Associate',
      'Cashier',
      'Stock Associate',
      'Assistant Manager',
      'Store Manager',
    ],
    employment_type: EMPLOYMENT_TYPES,
    salary_range: [
      '$12 – $14/hr',
      '$14 – $16/hr',
      '$16 – $18/hr',
      '$35,000 – $45,000/year',
      '$45,000 – $55,000/year',
      'Competitive — DOE',
    ],
    location: ['On-site', 'In-store'],
    requirement: [
      ...COMMON_REQ,
      'Customer service experience preferred',
      'Cash handling experience',
      'POS system experience',
      'Ability to lift up to 50 lbs',
      'Flexible schedule including weekends',
      'Leadership or supervisory experience',
    ],
    benefit: [
      ...COMMON_BEN,
      'Employee discounts',
      'Flexible scheduling',
      'Health insurance (full-time)',
      'Performance bonuses',
    ],
  },
  FACTORY: {
    department: ['Production', 'Fulfillment', 'Management', 'Quality Assurance'],
    job_title: [
      'Production Worker',
      'Assembly Technician',
      'QA/QC Inspector',
      'Shipping & Receiving',
      'Supervisor',
    ],
    employment_type: EMPLOYMENT_TYPES,
    salary_range: [
      '$14 – $16/hr',
      '$16 – $18/hr',
      '$18 – $22/hr',
      '$22 – $28/hr',
      'Competitive — DOE',
    ],
    location: ['On-site', 'Manufacturing floor'],
    requirement: [
      ...COMMON_REQ,
      'Ability to stand for extended periods',
      'Ability to lift up to 50 lbs',
      'OSHA safety training preferred',
      'Manufacturing or assembly experience preferred',
      'Forklift certification preferred',
      'Attention to detail',
      'Leadership or supervisory experience',
    ],
    benefit: [
      ...COMMON_BEN,
      'Overtime opportunities',
      'Health insurance (full-time)',
      '401(k) retirement plan',
      'Cross-training opportunities',
    ],
  },
  MEDICAL_OFFICE: {
    department: ['Clinical', 'Front Desk', 'Administration', 'Management'],
    job_title: ['Medical Assistant', 'Receptionist', 'Nurse'],
    employment_type: EMPLOYMENT_TYPES,
    salary_range: [
      '$14 – $18/hr',
      '$16 – $22/hr',
      '$22 – $28/hr',
      '$45,000 – $55,000/year',
      'Competitive — DOE',
    ],
    location: ['On-site', 'Medical office'],
    requirement: [
      ...COMMON_REQ,
      'Medical assistant certification (or willing to obtain)',
      'RN or LPN license (or willing to obtain)',
      'HIPAA awareness preferred',
      'Basic computer skills',
      'Strong communication skills',
      'Professional bedside manner',
      'Customer service experience preferred',
    ],
    benefit: [
      ...COMMON_BEN,
      'Health insurance (full-time)',
      'Paid time off',
      '401(k) retirement plan',
      'Stable work environment',
      'Career development programs',
    ],
  },
  CUSTOM: {
    department: ['Operations', 'Management', 'Administration'],
    job_title: [],
    employment_type: EMPLOYMENT_TYPES,
    salary_range: [
      '$12 – $14/hr',
      '$14 – $16/hr',
      '$16 – $18/hr',
      '$18 – $22/hr',
      'Competitive — DOE',
    ],
    location: ['On-site', 'Hybrid', 'Remote'],
    requirement: [...COMMON_REQ, 'Basic computer skills', 'Strong communication skills'],
    benefit: [...COMMON_BEN, 'Flexible scheduling'],
  },
};

/** All values seeded across any industry — used to detect cross-industry pollution. */
export function getAllSeededLookupValues(category: keyof LookupSeedData): Set<string> {
  const values = new Set<string>();
  for (const seed of Object.values(LOOKUPS_BY_INDUSTRY)) {
    for (const v of seed[category]) values.add(v);
  }
  return values;
}

export function getLookupSeedForIndustry(industry: CompanyIndustry): LookupSeedData {
  return LOOKUPS_BY_INDUSTRY[industry] ?? LOOKUPS_BY_INDUSTRY.CUSTOM;
}

/** @deprecated use getLookupSeedForIndustry */
export const LOOKUP_SEED = LOOKUPS_BY_INDUSTRY.SHIPPING_RETAIL;
