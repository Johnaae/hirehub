import nodemailer from 'nodemailer';
import type { Applicant } from '@prisma/client';

function isSmtpConfigured() {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.OWNER_EMAIL
  );
}

export async function sendNewApplicationEmail(applicant: Applicant) {
  if (!isSmtpConfigured()) {
    return { sent: false, reason: 'SMTP not configured' };
  }

  const fullName = `${applicant.firstName} ${applicant.lastName}`;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT!, 10),
      secure: parseInt(process.env.SMTP_PORT!, 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.OWNER_EMAIL,
      subject: 'New Job Application Received',
      text: `A new application was submitted by ${fullName}.

Position: ${applicant.position}
Phone: ${applicant.phone}
Email: ${applicant.email}`,
      html: `
        <h2>New Job Application Received</h2>
        <p>A new application was submitted by <strong>${fullName}</strong>.</p>
        <ul>
          <li><strong>Position:</strong> ${applicant.position}</li>
          <li><strong>Phone:</strong> ${applicant.phone}</li>
          <li><strong>Email:</strong> ${applicant.email}</li>
        </ul>
      `,
    });

    return { sent: true };
  } catch (err) {
    console.error('Failed to send email notification:', err);
    return { sent: false, reason: err instanceof Error ? err.message : 'Unknown error' };
  }
}
