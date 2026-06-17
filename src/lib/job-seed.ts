import prisma from './prisma';
import { LOOKUP_SEED, SYSTEM_TEMPLATES_BY_INDUSTRY } from './job-seed-data';
import { DEFAULT_COMPANY_ID } from './company';
import type { CompanyIndustry } from './industry';
import { COMPANY_INDUSTRIES } from './industry';

export async function ensureJobLookups(companyId: number = DEFAULT_COMPANY_ID) {
  let created = 0;
  for (const [category, values] of Object.entries(LOOKUP_SEED)) {
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const existing = await prisma.jobLookupOption.findUnique({
        where: {
          companyId_category_value: { companyId, category, value },
        },
      });
      if (!existing) {
        await prisma.jobLookupOption.create({
          data: { companyId, category, value, sortOrder: i },
        });
        created++;
      }
    }
  }
  if (created > 0) console.log(`Seeded ${created} job lookup options for company ${companyId}.`);
}

/** Remove legacy per-company system templates from before global template migration. */
export async function migrateLegacyJobTemplates() {
  const legacy = await prisma.jobTemplate.deleteMany({
    where: {
      isSystemTemplate: true,
      companyId: { not: null },
    },
  });
  if (legacy.count > 0) {
    console.log(`Removed ${legacy.count} legacy per-company system templates.`);
  }
}

export async function ensureSystemJobTemplates() {
  await migrateLegacyJobTemplates();

  let created = 0;
  for (const industry of COMPANY_INDUSTRIES) {
    if (industry === 'CUSTOM') continue;

    const templates = SYSTEM_TEMPLATES_BY_INDUSTRY[industry];
    for (const template of templates) {
      const existing = await prisma.jobTemplate.findFirst({
        where: {
          industry,
          title: template.title,
          isSystemTemplate: true,
          companyId: null,
        },
      });
      if (!existing) {
        await prisma.jobTemplate.create({
          data: {
            companyId: null,
            industry,
            name: template.title,
            title: template.title,
            department: template.department,
            employmentType: template.employmentType,
            salaryRange: template.salaryRange,
            locationType: template.locationType,
            description: template.description,
            requirements: template.requirements.join('\n'),
            benefits: template.benefits.join('\n'),
            isSystemTemplate: true,
          },
        });
        created++;
      }
    }
  }
  if (created > 0) console.log(`Seeded ${created} global system job templates.`);
}

export async function ensureCompanyIndustries() {
  await prisma.company.updateMany({
    where: {
      OR: [
        { id: DEFAULT_COMPANY_ID },
        { slug: 'default' },
        { name: { contains: 'UPS', mode: 'insensitive' } },
      ],
    },
    data: { industry: 'SHIPPING_RETAIL' },
  });

  await prisma.company.updateMany({
    where: {
      OR: [
        { name: { contains: 'nail', mode: 'insensitive' } },
        { slug: { contains: 'nail', mode: 'insensitive' } },
        { name: { contains: 'salon', mode: 'insensitive' } },
        { slug: { contains: 'salon', mode: 'insensitive' } },
      ],
    },
    data: { industry: 'NAIL_SALON' },
  });
}

export async function ensureJobTemplatesForIndustry(_industry: CompanyIndustry) {
  await ensureSystemJobTemplates();
}

export { LOOKUP_SEED, SYSTEM_TEMPLATES_BY_INDUSTRY };
