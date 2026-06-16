import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { applicationSchema, parseDateForDb } from '@/lib/validation';
import { sendNewApplicationEmail, sendApplicationReceivedEmail } from '@/lib/email';
import { logActivity } from '@/lib/activity';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { DEFAULT_COMPANY_ID, getCompanyBySlug } from '@/lib/company';

async function resolveCompanyId(
  jobId: number | null,
  companySlug: string | undefined
): Promise<{ companyId: number } | { error: NextResponse }> {
  if (jobId && !isNaN(jobId)) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { companyId: true },
    });
    if (!job) {
      return { error: NextResponse.json({ error: 'Job not found' }, { status: 404 }) };
    }
    return { companyId: job.companyId };
  }

  if (companySlug) {
    const company = await getCompanyBySlug(companySlug);
    if (!company) {
      return { error: NextResponse.json({ error: 'Company not found' }, { status: 404 }) };
    }
    return { companyId: company.id };
  }

  return { companyId: DEFAULT_COMPANY_ID };
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(`apply:${getClientIp(request)}`, 10, 3600_000);
  if (!rl.ok) return rl.response;

  try {
    const body = await request.json();
    const jobId = body.jobId ? parseInt(body.jobId, 10) : null;

    const parsed = applicationSchema.safeParse(body);

    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join('.') || 'form',
        message: e.message,
      }));
      console.error('Application validation failed:', details);
      return NextResponse.json(
        { error: 'Validation failed', details },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (!data.authorizedToWork) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: [{ field: 'authorizedToWork', message: 'You must be authorized to work in the United States to apply' }],
        },
        { status: 400 }
      );
    }

    if (!data.over18) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: [{ field: 'over18', message: 'You must be at least 18 years old to apply' }],
        },
        { status: 400 }
      );
    }

    const availableStartDate = parseDateForDb(data.availableStartDate);
    if (!availableStartDate) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: [{ field: 'availableStartDate', message: 'Valid start date is required' }],
        },
        { status: 400 }
      );
    }

    const resolved = await resolveCompanyId(jobId, body.companySlug);
    if ('error' in resolved) return resolved.error;
    const { companyId } = resolved;

    if (jobId && !isNaN(jobId)) {
      const job = await prisma.job.findFirst({
        where: { id: jobId, companyId },
      });
      if (!job) {
        return NextResponse.json({ error: 'Job not found for this company' }, { status: 400 });
      }
    }

    const applicant = await prisma.applicant.create({
      data: {
        companyId,
        jobId: jobId && !isNaN(jobId) ? jobId : null,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        position: data.position,
        employmentType: data.employmentType,
        authorizedToWork: data.authorizedToWork,
        over18: data.over18,
        customerServiceExperience: data.customerServiceExperience,
        upsPrintShippingExperience: data.upsPrintShippingExperience,
        availableStartDate,
        availabilityJson: data.availability ?? {},
        previousEmployer: data.previousEmployer ?? null,
        previousJobTitle: data.previousJobTitle ?? null,
        previousStartDate: parseDateForDb(data.previousStartDate),
        previousEndDate: parseDateForDb(data.previousEndDate),
        reasonForLeaving: data.reasonForLeaving ?? null,
        whyWorkHere: data.whyWorkHere,
        resumeFilename: data.resumeFilename ?? null,
        resumeUrl: data.resumeUrl ?? null,
        resumeKey: data.resumeKey ?? null,
      },
    });

    sendNewApplicationEmail(applicant).catch(console.error);
    sendApplicationReceivedEmail(applicant).catch(console.error);
    logActivity({
      action: 'New Application',
      details: `${applicant.firstName} ${applicant.lastName} applied for ${applicant.position}`,
      applicantId: applicant.id,
      companyId,
    }).catch(console.error);

    return NextResponse.json(
      { message: 'Application submitted successfully', id: applicant.id },
      { status: 201 }
    );
  } catch (err) {
    console.error('Application submission error:', err);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
