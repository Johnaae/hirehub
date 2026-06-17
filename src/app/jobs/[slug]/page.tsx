import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { DEFAULT_COMPANY_ID } from '@/lib/company';

type RouteParams = { params: Promise<{ slug: string }> };

/** Legacy route — redirects to company-scoped apply URL */
export default async function LegacyJobApplyPage({ params }: RouteParams) {
  const { slug: jobSlug } = await params;

  const job = await prisma.job.findFirst({
    where: { slug: jobSlug, companyId: DEFAULT_COMPANY_ID, status: 'Open' },
    include: { company: { select: { slug: true } } },
  });

  if (!job) notFound();

  redirect(`/careers/${job.company.slug}/apply/${job.id}`);
}
