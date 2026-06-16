import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { slugify } from './company';

export async function ensureDefaultCompany() {
  const storeName = process.env.STORE_NAME || 'The UPS Store Hiring Portal';

  const existing = await prisma.company.findUnique({ where: { id: 1 } });
  if (!existing) {
    await prisma.company.create({
      data: {
        id: 1,
        name: storeName,
        slug: 'default',
        address: process.env.STORE_ADDRESS || null,
        email: process.env.OWNER_EMAIL || null,
        primaryColor: process.env.PRIMARY_COLOR || '#351C15',
        accentColor: process.env.ACCENT_COLOR || '#FFB500',
        settings: {
          create: {
            ownerEmail: process.env.OWNER_EMAIL || null,
            smtpHost: process.env.SMTP_HOST || null,
            smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : null,
            smtpUser: process.env.SMTP_USER || null,
            smtpPass: process.env.SMTP_PASS || null,
          },
        },
      },
    });
    console.log('Default company created.');
  }
}

export async function ensureDefaultJobs() {
  const count = await prisma.job.count({ where: { companyId: 1 } });
  if (count > 0) return;

  const defaultJobs = [
    {
      title: 'Customer Service / Print & Shipping Associate',
      slug: 'customer-service-print-shipping',
      department: 'Operations',
      employmentType: 'Full-Time',
      location: 'On-site',
      description: 'Join our team as a Customer Service / Print & Shipping Associate. Greet customers, process shipping orders, handle printing services, and operate the POS system.',
      requirements: 'Friendly attitude\nReliable and punctual\nBasic computer skills\nCustomer service experience preferred\nMust be authorized to work in the United States',
      benefits: 'Flexible scheduling\nTeam environment\nGrowth opportunities',
    },
    {
      title: 'Part-Time Associate',
      slug: 'part-time-associate',
      department: 'Operations',
      employmentType: 'Part-Time',
      location: 'On-site',
      description: 'Flexible part-time position assisting with customer service, shipping, and printing tasks.',
      requirements: 'Friendly attitude\nReliable and punctual\nBasic computer skills',
      benefits: 'Flexible hours\nTeam environment',
    },
  ];

  for (const job of defaultJobs) {
    await prisma.job.create({ data: { companyId: 1, ...job, status: 'Open' } });
  }
  console.log('Default jobs seeded.');
}

export async function ensureDefaultAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set.');
    return;
  }

  const existing = await prisma.admin.findUnique({
    where: { email: adminEmail.toLowerCase() },
  });

  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.admin.create({
      data: {
        email: adminEmail.toLowerCase(),
        passwordHash,
        companyId: 1,
        name: 'Store Owner',
      },
    });
    console.log(`Default admin created: ${adminEmail}`);
  }
}

export { slugify };
