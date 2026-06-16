export const POSITIONS = [
  'Customer Service Associate',
  'Print & Shipping Associate',
  'Part-Time Associate',
  'Full-Time Associate',
] as const;

export const EMPLOYMENT_TYPES = ['Part-Time', 'Full-Time', 'Either'] as const;

export const STATUSES = ['New', 'Reviewing', 'Interview', 'Hired', 'Rejected'] as const;

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type ApplicantStatus = (typeof STATUSES)[number];
export type Position = (typeof POSITIONS)[number];
