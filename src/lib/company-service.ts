import prisma from './prisma';
import { slugify } from './company';
import { hashPassword } from './auth';
import { ensureJobLookups, ensureJobTemplates } from './job-seed';
import type { AdminRole } from './tenant';

export interface CreateCompanyInput {
  name: string;
  ownerName: string;
  ownerEmail: string;
  temporaryPassword: string;
  logoUrl?: string | null;
  primaryColor?: string;
  accentColor?: string;
  timezone?: string;
  slug?: string;
}

export async function createCompanyWithOwner(input: CreateCompanyInput) {
  const slug = input.slug || slugify(input.name);
  const email = input.ownerEmail.toLowerCase();

  const existingSlug = await prisma.company.findUnique({ where: { slug } });
  if (existingSlug) throw new Error('Company slug already exists');

  const existingEmail = await prisma.admin.findUnique({ where: { email } });
  if (existingEmail) throw new Error('Owner email already in use');

  const passwordHash = await hashPassword(input.temporaryPassword);

  const company = await prisma.company.create({
    data: {
      name: input.name,
      slug,
      logoUrl: input.logoUrl || null,
      primaryColor: input.primaryColor || '#351C15',
      accentColor: input.accentColor || '#FFB500',
      timezone: input.timezone || 'America/New_York',
      ownerEmail: email,
      email,
      status: 'active',
      subscriptionStatus: 'trial',
      settings: {
        create: {
          ownerEmail: email,
          uploadProvider: 'uploadthing',
        },
      },
      admins: {
        create: {
          email,
          passwordHash,
          name: input.ownerName,
          role: 'OWNER',
          notificationEmail: email,
        },
      },
    },
    include: { admins: true, settings: true },
  });

  await ensureJobLookups(company.id);
  await ensureJobTemplates(company.id);

  return company;
}

export async function getCompanyStats(companyId: number) {
  const [applicants, jobs, interviews, admins] = await Promise.all([
    prisma.applicant.count({ where: { companyId } }),
    prisma.job.count({ where: { companyId } }),
    prisma.interview.count({ where: { companyId } }),
    prisma.admin.count({ where: { companyId } }),
  ]);

  return { applicants, jobs, interviews, admins };
}

export async function assertCompanyActive(companyId: number) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { status: true, name: true },
  });
  if (!company) return { ok: false as const, reason: 'Company not found' };
  if (company.status === 'suspended') return { ok: false as const, reason: 'Company suspended', company };
  return { ok: true as const, company };
}

export { slugify };
