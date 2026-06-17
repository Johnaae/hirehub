import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCompanyApplyPath } from '@/lib/company-career';

type RouteParams = { params: Promise<{ slug: string }> };

/** Legacy route — redirects to company-scoped apply URL when slug is unambiguous */
export default async function LegacyJobApplyPage({ params }: RouteParams) {
  const { slug: jobSlug } = await params;

  const matches = await prisma.job.findMany({
    where: { slug: jobSlug, status: 'Open' },
    include: { company: { select: { slug: true, id: true } } },
    take: 2,
  });

  if (matches.length !== 1) notFound();

  const job = matches[0];
  redirect(getCompanyApplyPath(job.company, job.id));
}
