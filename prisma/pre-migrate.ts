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
    VALUES (1, 'Demo Company', 'demo-company', '#1e3a5f', '#3b82f6', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `).catch(async () => {
    console.log('Companies table not ready yet. Run npm run db:push first, then re-run this script if needed.');
  });

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
