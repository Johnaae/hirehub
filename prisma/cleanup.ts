/**
 * Safe multi-tenant data cleanup — does NOT delete applicants, jobs, admins, or resumes.
 * Run: npm run db:cleanup
 */
import { PrismaClient } from '@prisma/client';
import {
  ensureCompanyIndustries,
  fixDefaultSlugs,
  migrateLegacyJobTemplates,
  pruneObsoleteSystemTemplates,
  resyncAllCompanyJobLookups,
} from '../src/lib/job-seed';
import { slugify } from '../src/lib/company';

const prisma = new PrismaClient();

async function dedupeJobTemplates() {
  const templates = await prisma.jobTemplate.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      industry: true,
      title: true,
      isSystemTemplate: true,
      companyId: true,
    },
  });

  const seen = new Map<string, number>();
  const toDelete: number[] = [];

  for (const t of templates) {
    const key = `${t.industry ?? ''}|${t.title}|${t.isSystemTemplate}|${t.companyId ?? 'null'}`;
    const keeper = seen.get(key);
    if (keeper === undefined) {
      seen.set(key, t.id);
    } else {
      toDelete.push(t.id);
    }
  }

  if (toDelete.length > 0) {
    await prisma.jobTemplate.deleteMany({ where: { id: { in: toDelete } } });
    console.log(`Removed ${toDelete.length} duplicate job templates.`);
  }
}

async function assignMissingCompanyIds() {
  const companies = await prisma.company.findMany({ select: { id: true } });
  if (companies.length === 0) return;

  const fallbackCompanyId = companies[0].id;

  const applicantOrphans = await prisma.applicant.updateMany({
    where: { companyId: { notIn: companies.map((c) => c.id) } },
    data: { companyId: fallbackCompanyId },
  });
  if (applicantOrphans.count > 0) {
    console.log(`Reassigned ${applicantOrphans.count} applicants with invalid companyId.`);
  }

  const nullCompanyApplicants = await prisma.applicant.count({ where: { companyId: 0 } });
  if (nullCompanyApplicants > 0) {
    await prisma.applicant.updateMany({ where: { companyId: 0 }, data: { companyId: fallbackCompanyId } });
    console.log(`Assigned companyId to ${nullCompanyApplicants} applicants.`);
  }
}

async function removeOrphanLookups() {
  const companies = await prisma.company.findMany({ select: { id: true } });
  const validIds = companies.map((c) => c.id);
  if (validIds.length === 0) return;

  const deleted = await prisma.jobLookupOption.deleteMany({
    where: { companyId: { notIn: validIds } },
  });
  if (deleted.count > 0) {
    console.log(`Removed ${deleted.count} orphan job lookup records.`);
  }
}

async function ensureUniqueSlugs() {
  const companies = await prisma.company.findMany({ orderBy: { id: 'asc' } });
  const used = new Set<string>();

  for (const company of companies) {
    let slug = company.slug?.trim() || '';
    if (!slug || slug === 'default' || used.has(slug)) {
      const base = slug && slug !== 'default' ? slugify(slug) : slugify(company.name) || `company-${company.id}`;
      let candidate = base;
      let n = 1;
      while (used.has(candidate) || candidate === 'default') {
        candidate = `${base}-${n++}`;
      }
      slug = candidate;
      await prisma.company.update({ where: { id: company.id }, data: { slug } });
      console.log(`Updated company ${company.id} slug → ${slug}`);
    }
    used.add(slug);
  }
}

async function main() {
  console.log('Starting HireHub multi-tenant cleanup...');

  await ensureUniqueSlugs();
  await fixDefaultSlugs();
  await ensureCompanyIndustries();
  await migrateLegacyJobTemplates();
  await dedupeJobTemplates();
  await pruneObsoleteSystemTemplates();
  await removeOrphanLookups();
  await assignMissingCompanyIds();
  await resyncAllCompanyJobLookups();

  console.log('Cleanup complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
