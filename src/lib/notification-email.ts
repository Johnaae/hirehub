import prisma from './prisma';

/**
 * Resolves the email address used for owner alerts (new applicants, interviews, etc.).
 * Priority: admin.notificationEmail → company settings ownerEmail → company email → env OWNER_EMAIL
 */
export async function getOwnerNotificationEmail(companyId: number, adminId?: number): Promise<string | null> {
  const select = { notificationEmail: true, email: true } as const;

  if (adminId) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId }, select });
    if (admin?.notificationEmail) return admin.notificationEmail;
    if (admin?.email) return admin.email;
  }

  const admin = await prisma.admin.findFirst({
    where: { companyId, role: { in: ['OWNER', 'SUPER_ADMIN'] } },
    orderBy: { id: 'asc' },
    select,
  });
  if (admin?.notificationEmail) return admin.notificationEmail;
  if (admin?.email) return admin.email;

  const settings = await prisma.companySettings.findUnique({
    where: { companyId },
    select: { ownerEmail: true },
  });
  if (settings?.ownerEmail) return settings.ownerEmail;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { ownerEmail: true, email: true },
  });
  if (company?.ownerEmail) return company.ownerEmail;
  if (company?.email) return company.email;

  return process.env.OWNER_EMAIL || null;
}
