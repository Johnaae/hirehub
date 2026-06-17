import prisma from '../src/lib/prisma';
import { ensureDefaultAdmin, ensureDefaultCompany, ensureSuperAdmin } from '../src/lib/admin';
import {
  ensureCompanyIndustries,
  ensureSystemJobTemplates,
  fixDefaultSlugs,
  resyncAllCompanyJobLookups,
} from '../src/lib/job-seed';

async function main() {
  console.log('Seeding database...');
  await ensureDefaultCompany();
  await ensureDefaultAdmin();
  await ensureSuperAdmin();
  await ensureCompanyIndustries();
  await fixDefaultSlugs();
  await ensureSystemJobTemplates();
  await resyncAllCompanyJobLookups();
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
