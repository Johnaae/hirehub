import prisma from './prisma';
import { LOOKUP_SEED, JOB_TEMPLATES_SEED } from './job-seed-data';
import { DEFAULT_COMPANY_ID } from './company';

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

export async function ensureJobTemplates(companyId: number = DEFAULT_COMPANY_ID) {
  let created = 0;
  for (const template of JOB_TEMPLATES_SEED) {
    const existing = await prisma.jobTemplate.findUnique({
      where: { companyId_name: { companyId, name: template.name } },
    });
    if (!existing) {
      await prisma.jobTemplate.create({
        data: { companyId, isSystem: true, ...template },
      });
      created++;
    }
  }
  if (created > 0) console.log(`Seeded ${created} job templates for company ${companyId}.`);
}

export { JOB_TEMPLATES_SEED, LOOKUP_SEED };
