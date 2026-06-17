import prisma from './prisma';
import { SYSTEM_TEMPLATES_BY_INDUSTRY } from './job-seed-data';
import { getLookupSeedForIndustry } from './job-lookup-seed';
import type { CompanyIndustry } from './industry';
import { COMPANY_INDUSTRIES, isValidIndustry } from './industry';
import { LOOKUP_CATEGORIES } from './jobs';
import { slugify } from './company';

/**
 * Sync job lookup options for a company to match its industry.
 * Removes cross-industry/orphan values and ensures industry defaults exist.
 */
export async function syncCompanyJobLookups(companyId: number, industry?: CompanyIndustry) {
  let resolvedIndustry = industry;
  if (!resolvedIndustry) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { industry: true },
    });
    if (!company) return { removed: 0 };
    resolvedIndustry = isValidIndustry(company.industry) ? company.industry : 'CUSTOM';
  }

  const seed = getLookupSeedForIndustry(resolvedIndustry);
  let removed = 0;

  for (const category of LOOKUP_CATEGORIES) {
    const values = [...seed[category]];

    const deleted = await prisma.jobLookupOption.deleteMany({
      where: {
        companyId,
        category,
        ...(values.length > 0 ? { value: { notIn: values } } : {}),
      },
    });
    removed += deleted.count;

    const existing = await prisma.jobLookupOption.findMany({
      where: { companyId, category },
      select: { value: true },
    });
    const existingSet = new Set(existing.map((e) => e.value));
    const toCreate = values
      .map((value, i) => ({ companyId, category, value, sortOrder: i }))
      .filter((row) => !existingSet.has(row.value));

    if (toCreate.length > 0) {
      await prisma.jobLookupOption.createMany({ data: toCreate, skipDuplicates: true });
    }

    for (let i = 0; i < values.length; i++) {
      await prisma.jobLookupOption.updateMany({
        where: { companyId, category, value: values[i] },
        data: { sortOrder: i },
      });
    }
  }

  if (removed > 0) {
    console.log(
      `Synced job lookups for company ${companyId} (${resolvedIndustry}): removed ${removed} cross-industry/orphan values.`
    );
  }

  return { removed };
}

/** @deprecated use syncCompanyJobLookups */
export async function ensureJobLookups(companyId: number) {
  return syncCompanyJobLookups(companyId);
}

export async function resyncAllCompanyJobLookups() {
  const companies = await prisma.company.findMany({ select: { id: true, industry: true } });
  let totalRemoved = 0;
  for (const company of companies) {
    const industry = isValidIndustry(company.industry) ? company.industry : 'CUSTOM';
    const { removed } = await syncCompanyJobLookups(company.id, industry);
    totalRemoved += removed;
  }
  if (totalRemoved > 0) {
    console.log(`Purged ${totalRemoved} cross-industry/orphan lookup records across all companies.`);
  }
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

/** Remove system templates that are no longer in the industry seed catalog. */
export async function pruneObsoleteSystemTemplates() {
  const allSystem = await prisma.jobTemplate.findMany({
    where: { isSystemTemplate: true, companyId: null },
    select: { id: true, industry: true, title: true },
  });

  let removed = 0;
  for (const template of allSystem) {
    if (!template.industry || template.industry === 'CUSTOM') {
      await prisma.jobTemplate.delete({ where: { id: template.id } });
      removed++;
      continue;
    }
    const industry = template.industry as Exclude<CompanyIndustry, 'CUSTOM'>;
    const catalog = SYSTEM_TEMPLATES_BY_INDUSTRY[industry];
    if (!catalog || !catalog.some((t) => t.title === template.title)) {
      await prisma.jobTemplate.delete({ where: { id: template.id } });
      removed++;
    }
  }
  if (removed > 0) console.log(`Removed ${removed} obsolete system job templates.`);
}

export async function ensureSystemJobTemplates() {
  await migrateLegacyJobTemplates();
  await pruneObsoleteSystemTemplates();

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
        { slug: 'default' },
        { name: { contains: 'ups store', mode: 'insensitive' } },
        { slug: { contains: 'ups', mode: 'insensitive' } },
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

/** Fix companies still using the reserved slug "default". */
export async function fixDefaultSlugs() {
  const companies = await prisma.company.findMany({ where: { slug: 'default' } });
  for (const company of companies) {
    const base = slugify(company.name) || `company-${company.id}`;
    let candidate = base;
    let n = 1;
    while (await prisma.company.findFirst({ where: { slug: candidate, id: { not: company.id } } })) {
      candidate = `${base}-${n++}`;
    }
    await prisma.company.update({ where: { id: company.id }, data: { slug: candidate } });
    console.log(`Renamed company ${company.id} slug default → ${candidate}`);
  }
}

export { SYSTEM_TEMPLATES_BY_INDUSTRY };
