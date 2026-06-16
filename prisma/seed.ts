import prisma from '../src/lib/prisma';
import { ensureDefaultAdmin, ensureDefaultCompany, ensureDefaultJobs } from '../src/lib/admin';

async function main() {
  console.log('Seeding database...');
  await ensureDefaultCompany();
  await ensureDefaultAdmin();
  await ensureDefaultJobs();
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
