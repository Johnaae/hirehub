import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';
import { ensureDefaultAdmin } from '../src/lib/admin';

async function main() {
  console.log('Seeding database...');
  await ensureDefaultAdmin();
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
