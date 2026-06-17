import nodemailer from 'nodemailer';
import type { Applicant, Interview } from '@prisma/client';
import { getOwnerNotificationEmail } from './notification-email';
import {
  formatHireHubFromAddress,
  getCompanyEmailContext,
  getSharedSmtpTransport,
  isSharedSmtpConfigured,
  type CompanyEmailContext,
} from './company-smtp';

export type EmailStatus = 'sent' | 'not_configured' | 'failed';

export type EmailSendResult =
  | { sent: true; emailStatus: 'sent' }
  | { sent: false; emailStatus: 'not_configured' | 'failed'; reason?: string };

interface EmailBodyOptions {
  jobTitle?: string;
  interviewTime?: string;
}

function emailWrapper(
  title: string,
  body: string,
  ctx: CompanyEmailContext,
  options: EmailBodyOptions = {}
) {
  const logoHtml = ctx.logoUrl
    ? `<img src="${ctx.logoUrl}" alt="${ctx.companyName}" style="max-height: 52px; margin-bottom: 12px; display: block;" />`
    : '';

  const metaLines: string[] = [];
  if (options.jobTitle) {
    metaLines.push(`<p style="margin: 0 0 8px;"><strong>Position:</strong> ${options.jobTitle}</p>`);
  }
  if (options.interviewTime) {
    metaLines.push(`<p style="margin: 0 0 8px;"><strong>Interview:</strong> ${options.interviewTime}</p>`);
  }
  const metaBlock = metaLines.length
    ? `<div style="background: #f8fafc; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">${metaLines.join('')}</div>`
    : '';

  const contactLine = ctx.contactEmail
    ? `<p style="margin-top: 20px;">Questions? Reply to this email or contact <a href="mailto:${ctx.contactEmail}">${ctx.contactEmail}</a>.</p>`
    : '';

  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: ${ctx.primaryColor}; color: ${ctx.accentColor}; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        ${logoHtml}
        <strong style="font-size: 18px;">${ctx.companyName}</strong>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: ${ctx.primaryColor}; margin-top: 0;">${title}</h2>
        ${metaBlock}
        ${body}
        ${contactLine}
        <p style="color: #737373; font-size: 13px; margin-top: 24px;">Sent by ${ctx.companyName} via HireHub.</p>
      </div>
    </div>
  `;
}

export async function sendEmail(
  companyId: number,
  to: string,
  subject: string,
  html: string,
  text: string,
  ctx?: CompanyEmailContext
): Promise<EmailSendResult> {
  const transport = getSharedSmtpTransport();
  if (!transport) {
    return { sent: false, emailStatus: 'not_configured', reason: 'Shared SMTP not configured' };
  }

  const emailCtx = ctx ?? (await getCompanyEmailContext(companyId));

  try {
    const mailer = nodemailer.createTransport({
      host: transport.host,
      port: transport.port,
      secure: transport.secure,
      auth: { user: transport.user, pass: transport.pass },
    });

    await mailer.sendMail({
      from: formatHireHubFromAddress(emailCtx.companyName),
      to,
      subject,
      html,
      text,
      ...(emailCtx.replyTo ? { replyTo: emailCtx.replyTo } : {}),
    });

    return { sent: true, emailStatus: 'sent' };
  } catch (err) {
    console.error('Email send failed:', err);
    return {
      sent: false,
      emailStatus: 'failed',
      reason: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function sendNewApplicationEmail(applicant: Applicant): Promise<EmailSendResult> {
  const ctx = await getCompanyEmailContext(applicant.companyId);
  const ownerEmail = await getOwnerNotificationEmail(applicant.companyId);
  if (!ownerEmail) {
    return { sent: false, emailStatus: 'not_configured', reason: 'Notification email not configured' };
  }

  const fullName = `${applicant.firstName} ${applicant.lastName}`;
  const subject = `[${ctx.companyName}] New Job Application — ${applicant.position}`;
  const text = `A new application was submitted to ${ctx.companyName}.\n\nApplicant: ${fullName}\nPosition: ${applicant.position}\nPhone: ${applicant.phone}\nEmail: ${applicant.email}`;
  const html = emailWrapper(
    'New Application',
    `<p>A new application was submitted to <strong>${ctx.companyName}</strong>.</p>
     <ul>
       <li><strong>Applicant:</strong> ${fullName}</li>
       <li><strong>Phone:</strong> ${applicant.phone}</li>
       <li><strong>Email:</strong> ${applicant.email}</li>
     </ul>`,
    ctx,
    { jobTitle: applicant.position }
  );

  return sendEmail(applicant.companyId, ownerEmail, subject, html, text, ctx);
}

export async function sendApplicationReceivedEmail(applicant: Applicant): Promise<EmailSendResult> {
  const ctx = await getCompanyEmailContext(applicant.companyId);
  const subject = `[${ctx.companyName}] Application Received — ${applicant.position}`;
  const text = `Hi ${applicant.firstName},\n\nThank you for applying to ${ctx.companyName} for ${applicant.position}. We have received your application and will review it shortly.\n\nBest regards,\n${ctx.companyName}`;
  const html = emailWrapper(
    'Application Received',
    `<p>Hi <strong>${applicant.firstName}</strong>,</p>
     <p>Thank you for applying to <strong>${ctx.companyName}</strong>. We have received your application and will review it shortly.</p>
     <p>We appreciate your interest in joining our team!</p>`,
    ctx,
    { jobTitle: applicant.position }
  );
  return sendEmail(applicant.companyId, applicant.email, subject, html, text, ctx);
}

export async function sendStatusChangeEmail(
  applicant: Applicant,
  status: string
): Promise<EmailSendResult> {
  const ctx = await getCompanyEmailContext(applicant.companyId);
  const templates: Record<string, { subject: string; title: string; body: string }> = {
    Reviewing: {
      subject: `[${ctx.companyName}] Application Under Review — ${applicant.position}`,
      title: 'Application Under Review',
      body: `<p>Hi <strong>${applicant.firstName}</strong>,</p><p>Your application to <strong>${ctx.companyName}</strong> for <strong>${applicant.position}</strong> is now being reviewed. We will be in touch soon.</p>`,
    },
    Interview: {
      subject: `[${ctx.companyName}] Interview Invitation — ${applicant.position}`,
      title: 'Interview Invitation',
      body: `<p>Hi <strong>${applicant.firstName}</strong>,</p><p>Congratulations! <strong>${ctx.companyName}</strong> would like to invite you for an interview for the <strong>${applicant.position}</strong> position. We will contact you shortly with scheduling details.</p>`,
    },
    Hired: {
      subject: `[${ctx.companyName}] Welcome to the Team — ${applicant.position}`,
      title: "You're Hired!",
      body: `<p>Hi <strong>${applicant.firstName}</strong>,</p><p>We are thrilled to offer you the <strong>${applicant.position}</strong> position at <strong>${ctx.companyName}</strong>! Welcome to the team.</p>`,
    },
    Rejected: {
      subject: `[${ctx.companyName}] Application Update — ${applicant.position}`,
      title: 'Application Update',
      body: `<p>Hi <strong>${applicant.firstName}</strong>,</p><p>Thank you for your interest in <strong>${ctx.companyName}</strong>. After careful consideration, we have decided to move forward with other candidates for <strong>${applicant.position}</strong>.</p>`,
    },
  };

  const template = templates[status];
  if (!template) return { sent: false, emailStatus: 'failed', reason: 'No template for status' };

  const text = template.body.replace(/<[^>]+>/g, '');
  const html = emailWrapper(template.title, template.body, ctx, { jobTitle: applicant.position });
  return sendEmail(applicant.companyId, applicant.email, template.subject, html, text, ctx);
}

export async function sendInterviewEmail(
  applicant: Applicant,
  interview: Interview
): Promise<EmailSendResult> {
  const ctx = await getCompanyEmailContext(applicant.companyId);
  const interviewTime = new Date(interview.scheduledAt).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const meetSection = interview.meetLink
    ? `<p><strong>Meeting Link:</strong> <a href="${interview.meetLink}">${interview.meetLink}</a></p>`
    : '';

  const notesSection = interview.notes ? `<p><strong>Notes:</strong> ${interview.notes}</p>` : '';

  const subject = `[${ctx.companyName}] Interview Scheduled — ${applicant.position}`;
  const body = `<p>Hi <strong>${applicant.firstName}</strong>,</p>
    <p>Your interview with <strong>${ctx.companyName}</strong> has been scheduled.</p>
    ${meetSection}${notesSection}
    <p>We look forward to meeting you!</p>`;

  const text = body.replace(/<[^>]+>/g, '');
  const html = emailWrapper('Interview Scheduled', body, ctx, {
    jobTitle: applicant.position,
    interviewTime,
  });
  return sendEmail(applicant.companyId, applicant.email, subject, html, text, ctx);
}

/** Super-admin test using shared HireHub SMTP with a sample company context. */
export async function sendPlatformTestEmail(
  to: string,
  sampleCompanyName = 'HireHub Demo Company'
): Promise<EmailSendResult> {
  if (!isSharedSmtpConfigured()) {
    return { sent: false, emailStatus: 'not_configured', reason: 'Shared SMTP not configured' };
  }

  const ctx: CompanyEmailContext = {
    companyId: 0,
    companyName: sampleCompanyName,
    logoUrl: '',
    contactEmail: to,
    replyTo: to,
    primaryColor: '#1e3a5f',
    accentColor: '#3b82f6',
  };

  const subject = `[${sampleCompanyName}] HireHub SMTP Test`;
  const text = `This is a test email from ${sampleCompanyName} via HireHub shared SMTP.`;
  const html = emailWrapper(
    'SMTP Test',
    `<p>If you received this message, the shared HireHub SMTP configuration is working.</p>
     <p><strong>From format:</strong> ${sampleCompanyName} via HireHub &lt;${process.env.DEFAULT_FROM_EMAIL}&gt;</p>`,
    ctx,
    { jobTitle: 'Sample Position' }
  );

  return sendEmail(0, to, subject, html, text, ctx);
}

export { isSharedSmtpConfigured };
