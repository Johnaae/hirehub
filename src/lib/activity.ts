import prisma from './prisma';

export async function logActivity(params: {
  action: string;
  details?: string;
  applicantId?: number;
  adminId?: number;
  companyId: number;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        companyId: params.companyId,
        applicantId: params.applicantId,
        adminId: params.adminId,
        action: params.action,
        details: params.details,
      },
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}
