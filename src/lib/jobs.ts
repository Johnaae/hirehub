export const JOB_STATUSES = ['Open', 'Closed', 'Draft', 'Archived', 'Paused', 'Filled'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const LOOKUP_CATEGORIES = [
  'department',
  'job_title',
  'employment_type',
  'salary_range',
  'location',
  'requirement',
  'benefit',
] as const;

export type LookupCategory = (typeof LOOKUP_CATEGORIES)[number];

export function linesToArray(text: string | null | undefined): string[] {
  if (!text) return [];
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
}

export function arrayToLines(items: string[]): string {
  return items.filter(Boolean).join('\n');
}
