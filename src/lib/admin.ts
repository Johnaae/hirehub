import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { slugify } from './company';

export async function ensureDefaultCompany() {
  const storeName = process.env.STORE_NAME || 'Demo Company';
  const slug = process.env.COMPANY_SLUG ? slugify(process.env.COMPANY_SLUG) : 'demo-company';

  const existing = await prisma.company.findUnique({ where: { id: 1 } });
  if (!existing) {
    await prisma.company.create({
      data: {
        id: 1,
        name: storeName,
        slug,
        address: process.env.STORE_ADDRESS || null,
        email: process.env.OWNER_EMAIL || null,
        ownerEmail: process.env.OWNER_EMAIL || null,
        primaryColor: process.env.PRIMARY_COLOR || '#1e3a5f',
        accentColor: process.env.ACCENT_COLOR || '#3b82f6',
        status: 'active',
        subscriptionStatus: 'active',
        industry: 'SHIPPING_RETAIL',
        settings: {
          create: {
            ownerEmail: process.env.OWNER_EMAIL || null,
          },
        },
      },
    });
    console.log('Default company created.');
  } else {
    await prisma.company.update({
      where: { id: 1 },
      data: {
        status: existing.status || 'active',
        subscriptionStatus: existing.subscriptionStatus || 'active',
        industry: existing.industry || 'SHIPPING_RETAIL',
        ownerEmail: existing.ownerEmail || process.env.OWNER_EMAIL || existing.email,
        ...(existing.slug === 'default' ? { slug } : {}),
      },
    });
  }
}

export async function migrateExistingDataToMultitenant() {
  console.log('Running multi-tenant migration...');

  await ensureDefaultCompany();

  const admins = await prisma.admin.findMany();
  for (const admin of admins) {
    if (!admin.role) {
      await prisma.admin.update({
        where: { id: admin.id },
        data: { role: 'OWNER', companyId: admin.companyId || 1 },
      });
    }
  }

  console.log('Multi-tenant migration complete.');
}

export async function ensureDefaultAdmin() {
  await migrateExistingDataToMultitenant();

  const adminCount = await prisma.admin.count({ where: { role: { not: 'SUPER_ADMIN' } } });
  if (adminCount > 0) {
    await prisma.admin.updateMany({
      where: { role: { not: 'SUPER_ADMIN' } },
      data: { role: 'OWNER' },
    });
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('No admin exists and ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed.');
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.admin.create({
    data: {
      email: adminEmail.toLowerCase(),
      passwordHash,
      companyId: 1,
      name: 'Store Owner',
      role: 'OWNER',
      notificationEmail: process.env.OWNER_EMAIL?.toLowerCase() || adminEmail.toLowerCase(),
    },
  });
  console.log(`Default owner created: ${adminEmail}`);
}

export async function ensureSuperAdmin() {
  const superEmail = process.env.SUPER_ADMIN_EMAIL;
  const superPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!superEmail || !superPassword) return;

  const existing = await prisma.admin.findUnique({ where: { email: superEmail.toLowerCase() } });
  if (existing) {
    if (existing.role !== 'SUPER_ADMIN') {
      await prisma.admin.update({
        where: { id: existing.id },
        data: { role: 'SUPER_ADMIN' },
      });
    }
    return;
  }

  const passwordHash = await bcrypt.hash(superPassword, 12);
  await prisma.admin.create({
    data: {
      email: superEmail.toLowerCase(),
      passwordHash,
      companyId: 1,
      name: 'Platform Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`Super admin created: ${superEmail}`);
}

export { slugify };
