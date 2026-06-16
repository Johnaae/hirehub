import bcrypt from 'bcryptjs';
import prisma from './prisma';

export async function ensureDefaultAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping default admin creation.');
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
      },
    });
    console.log(`Default admin created: ${adminEmail}`);
  } else {
    console.log('Admin account already exists.');
  }
}
