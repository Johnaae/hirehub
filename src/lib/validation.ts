import { z } from 'zod';
import { POSITIONS, EMPLOYMENT_TYPES } from './constants';

/** Treat empty strings and undefined as null */
function emptyToNull(val: unknown) {
  if (val === '' || val === undefined) return null;
  return val;
}

/** Accept YYYY-MM-DD or null/empty */
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date (YYYY-MM-DD)');

const optionalDateString = z.preprocess(
  emptyToNull,
  dateString.nullable().optional()
);

const requiredDateString = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim() : val),
  dateString
);

const optionalString = z.preprocess(
  emptyToNull,
  z.string().trim().max(255).nullable().optional()
);

const optionalLongString = z.preprocess(
  emptyToNull,
  z.string().trim().nullable().optional()
);

const optionalUrl = z.preprocess(
  emptyToNull,
  z.string().url('Must be a valid URL').nullable().optional()
);

export const applicationSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().min(1, 'Phone is required').max(50),
  address: z.string().trim().min(1, 'Address is required').max(255),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(50),
  zip: z.string().trim().min(1, 'ZIP code is required').max(20),
  position: z.enum(POSITIONS as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a position' }),
  }),
  employmentType: z.enum(EMPLOYMENT_TYPES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select an employment type' }),
  }),
  authorizedToWork: z.boolean({ required_error: 'Work authorization is required' }),
  over18: z.boolean({ required_error: 'Age confirmation is required' }),
  customerServiceExperience: z.boolean({ required_error: 'Customer service experience answer is required' }),
  upsPrintShippingExperience: z.boolean({ required_error: 'Experience answer is required' }),
  availableStartDate: requiredDateString,
  whyWorkHere: z.string().trim().min(1, 'Please tell us why you want to work here'),
  certified: z.literal(true, { errorMap: () => ({ message: 'You must certify the information is true' }) }),
  // Optional fields
  availability: z.preprocess(
    (val) => (val && typeof val === 'object' ? val : {}),
    z.record(z.string()).optional().default({})
  ),
  previousEmployer: optionalString,
  previousJobTitle: optionalString,
  previousStartDate: optionalDateString,
  previousEndDate: optionalDateString,
  reasonForLeaving: optionalLongString,
  resumeFilename: optionalLongString,
  resumeUrl: optionalUrl,
  resumeKey: optionalLongString,
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export function parseDateForDb(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [year, month, day] = trimmed.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (isNaN(date.getTime())) return null;
  return date;
}

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const statusSchema = z.object({
  status: z.enum(['New', 'Reviewing', 'Interview', 'Hired', 'Rejected']),
});

export const notesSchema = z.object({
  notes: z.string(),
});
