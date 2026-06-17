import nodemailer from 'nodemailer';
import type { Applicant, Interview } from '@prisma/client';
import { getStoreConfig } from './config';
import { getOwnerNotificationEmail } from './notification-email';

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

function getSmtpConfig(): SmtpConfig | null {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_USER,
    };
  }
  return null;
}

function createTransporter(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });
}

function emailWrapper(title: string, body: string, storeName: string, primaryColor = '#1e3a5f', accentColor = '#3b82f6') {
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: ${primaryColor}; color: ${accentColor}; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <strong>${storeName}</strong>
      </div>
      <div style="background: #fff; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: ${primaryColor}; margin-top: 0;">${title}</h2>
        ${body}
        <p style="color: #737373; font-size: 13px; margin-top: 24px;">This is an automated message from ${storeName}.</p>
      </div>
    </div>
  `;
}

export async function sendEmail(to: string, subject: string, html: string, text: string) {
  const smtp = getSmtpConfig();
  if (!smtp) return { sent: false, reason: 'SMTP not configured' };

  try {
    const transporter = createTransporter(smtp);
    await transporter.sendMail({ from: smtp.from, to, subject, html, text });
    return { sent: true };
  } catch (err) {
    console.error('Email send failed:', err);
    return { sent: false, reason: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function sendNewApplicationEmail(applicant: Applicant) {
  const config = await getStoreConfig(applicant.companyId);
  const ownerEmail = await getOwnerNotificationEmail(applicant.companyId);
  if (!ownerEmail) return { sent: false, reason: 'Notification email not configured' };

  const fullName = `${applicant.firstName} ${applicant.lastName}`;
  const subject = 'New Job Application Received';
  const text = `A new application was submitted by ${fullName}.\nPosition: ${applicant.position}\nPhone: ${applicant.phone}\nEmail: ${applicant.email}`;
  const html = emailWrapper(
    'New Application',
    `<p>A new application was submitted by <strong>${fullName}</strong>.</p>
     <ul><li><strong>Position:</strong> ${applicant.position}</li>
     <li><strong>Phone:</strong> ${applicant.phone}</li>
     <li><strong>Email:</strong> ${applicant.email}</li></ul>`,
    config.storeName,
    config.primaryColor,
    config.accentColor
  );

  return sendEmail(ownerEmail, subject, html, text);
}

export async function sendApplicationReceivedEmail(applicant: Applicant) {
  const config = await getStoreConfig(applicant.companyId);
  const subject = `Application Received — ${config.storeName}`;
  const text = `Hi ${applicant.firstName},\n\nThank you for applying for ${applicant.position}. We have received your application and will review it shortly.\n\nBest regards,\n${config.storeName}`;
  const html = emailWrapper(
    'Application Received',
    `<p>Hi <strong>${applicant.firstName}</strong>,</p>
     <p>Thank you for applying for <strong>${applicant.position}</strong>. We have received your application and will review it shortly.</p>
     <p>We appreciate your interest in joining our team!</p>`,
    config.storeName,
    config.primaryColor,
    config.accentColor
  );
  return sendEmail(applicant.email, subject, html, text);
}

export async function sendStatusChangeEmail(applicant: Applicant, status: string) {
  const config = await getStoreConfig(applicant.companyId);
  const templates: Record<string, { subject: string; title: string; body: string }> = {
    Reviewing: {
      subject: `Application Update — ${config.storeName}`,
      title: 'Application Under Review',
      body: `<p>Hi <strong>${applicant.firstName}</strong>,</p><p>Your application for <strong>${applicant.position}</strong> is now being reviewed by our team. We will be in touch soon.</p>`,
    },
    Interview: {
      subject: `Interview Invitation — ${config.storeName}`,
      title: 'Interview Invitation',
      body: `<p>Hi <strong>${applicant.firstName}</strong>,</p><p>Congratulations! We would like to invite you for an interview for the <strong>${applicant.position}</strong> position. We will contact you shortly with scheduling details.</p>`,
    },
    Hired: {
      subject: `Welcome to the Team! — ${config.storeName}`,
      title: 'You\'re Hired!',
      body: `<p>Hi <strong>${applicant.firstName}</strong>,</p><p>We are thrilled to offer you the <strong>${applicant.position}</strong> position! Welcome to the team. We will send onboarding details shortly.</p>`,
    },
    Rejected: {
      subject: `Application Update — ${config.storeName}`,
      title: 'Application Update',
      body: `<p>Hi <strong>${applicant.firstName}</strong>,</p><p>Thank you for your interest in the <strong>${applicant.position}</strong> position. After careful consideration, we have decided to move forward with other candidates. We wish you the best in your job search.</p>`,
    },
  };

  const template = templates[status];
  if (!template) return { sent: false, reason: 'No template for status' };

  const text = template.body.replace(/<[^>]+>/g, '');
  const html = emailWrapper(template.title, template.body, config.storeName, config.primaryColor, config.accentColor);
  return sendEmail(applicant.email, template.subject, html, text);
}

export async function sendInterviewEmail(
  applicant: Applicant,
  interview: Interview,
  storeName: string
) {
  const config = await getStoreConfig(applicant.companyId);
  const date = new Date(interview.scheduledAt).toLocaleString('en-US', {
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

  const subject = `Interview Scheduled — ${storeName}`;
  const body = `<p>Hi <strong>${applicant.firstName}</strong>,</p>
    <p>Your interview for <strong>${applicant.position}</strong> has been scheduled.</p>
    <p><strong>Date & Time:</strong> ${date}</p>
    ${meetSection}${notesSection}
    <p>We look forward to meeting you!</p>`;

  const text = body.replace(/<[^>]+>/g, '');
  const html = emailWrapper('Interview Scheduled', body, storeName, config.primaryColor, config.accentColor);
  return sendEmail(applicant.email, subject, html, text);
}
