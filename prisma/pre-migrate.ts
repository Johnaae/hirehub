/**
 * Run once when upgrading to SaaS schema on an existing database:
 *   npx tsx prisma/pre-migrate.ts
 *   npm run db:push
 *   npm run db:seed
 */
import prisma from '../src/lib/prisma';

async function main() {
  console.log('Pre-migration: ensuring company row exists...');

  await prisma.$executeRawUnsafe(`
    INSERT INTO companies (id, name, slug, primary_color, accent_color, created_at, updated_at)
    VALUES (1, 'The UPS Store Hiring Portal', 'default', '#351C15', '#FFB500', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `).catch(async () => {
    // Table may not exist yet — create via Prisma after db:push
    console.log('Companies table not ready yet. Run npm run db:push first, then re-run this script if needed.');
  });

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
