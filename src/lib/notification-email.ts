import prisma from './prisma';
import { DEFAULT_COMPANY_ID } from './company';

/**
 * Resolves the email address used for owner alerts (new applicants, interviews, etc.).
 * Priority: admin.notificationEmail → company settings ownerEmail → company email → env OWNER_EMAIL
 */
export async function getOwnerNotificationEmail(adminId?: number): Promise<string | null> {
  const select = { notificationEmail: true, email: true } as const;

  if (adminId) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId }, select });
    if (admin?.notificationEmail) return admin.notificationEmail;
    if (admin?.email) return admin.email;
  } else {
    const admin = await prisma.admin.findFirst({
      where: { companyId: DEFAULT_COMPANY_ID },
      orderBy: { id: 'asc' },
      select,
    });
    if (admin?.notificationEmail) return admin.notificationEmail;
    if (admin?.email) return admin.email;
  }

  const settings = await prisma.companySettings.findUnique({
    where: { companyId: DEFAULT_COMPANY_ID },
    select: { ownerEmail: true },
  });
  if (settings?.ownerEmail) return settings.ownerEmail;

  const company = await prisma.company.findUnique({
    where: { id: DEFAULT_COMPANY_ID },
    select: { email: true },
  });
  if (company?.email) return company.email;

  return process.env.OWNER_EMAIL || null;
}
