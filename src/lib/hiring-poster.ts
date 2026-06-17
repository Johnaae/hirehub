import { jsPDF } from 'jspdf';
import type { CompanyCareerRef } from './company-career';
import { getCompanyQrCareerUrl, getShortCareerDisplayUrl } from './company-career';
import {
  POSTER_BENEFITS,
  POSTER_FOOTER,
  POSTER_HEADLINE,
  POSTER_QR_LABEL,
  POSTER_QR_TAGLINE,
  POSTER_SUBHEADLINE,
} from './hiring-poster-constants';
import { generateQrPngBuffer } from './qr-code';

export interface PosterJob {
  title: string;
  department?: string | null;
  employmentType?: string | null;
  salary?: string | null;
}

export interface PosterCompany {
  name: string;
  logoUrl?: string | null;
  address?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
}

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace('#', '').trim();
  const normalized =
    raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw.padStart(6, '0').slice(0, 6);
  const n = parseInt(normalized, 16);
  if (Number.isNaN(n)) return [30, 58, 95];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function setFill(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setFillColor(r, g, b);
}

function setText(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setTextColor(r, g, b);
}

function setDraw(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setDrawColor(r, g, b);
}

async function loadImageDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

function drawJobCard(
  doc: jsPDF,
  job: PosterJob,
  x: number,
  y: number,
  w: number,
  h: number,
  primary: string,
  accent: string
) {
  setDraw(doc, accent);
  doc.setLineWidth(0.75);
  doc.roundedRect(x, y, w, h, 6, 6, 'S');

  setFill(doc, primary);
  doc.roundedRect(x, y, w, 5, 6, 6, 'F');
  doc.rect(x, y + 3, w, 2, 'F');

  let textY = y + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  setText(doc, '#1a1a1a');
  const titleLines = doc.splitTextToSize(job.title, w - 16);
  doc.text(titleLines.slice(0, 2), x + 8, textY);
  textY += titleLines.length > 1 ? 22 : 14;

  const meta: string[] = [];
  if (job.department?.trim()) meta.push(job.department.trim());
  if (job.employmentType?.trim()) meta.push(job.employmentType.trim());
  if (meta.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setText(doc, '#555555');
    doc.text(meta.join('  ·  '), x + 8, textY);
    textY += 12;
  }

  if (job.salary?.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setText(doc, primary);
    doc.text(job.salary.trim(), x + 8, textY);
  }
}

function drawBenefits(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  primary: string,
  accent: string
): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setText(doc, primary);
  doc.text('Why Join Us', x, y);

  const colW = (w - 12) / 2;
  const rowH = 16;
  let benefitY = y + 16;

  POSTER_BENEFITS.forEach((benefit, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = x + col * (colW + 12);
    const by = benefitY + row * rowH;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setText(doc, accent);
    doc.text('✓', bx, by);

    doc.setFont('helvetica', 'normal');
    setText(doc, '#333333');
    doc.text(benefit, bx + 12, by);
  });

  return benefitY + Math.ceil(POSTER_BENEFITS.length / 2) * rowH + 4;
}

export async function generateHiringPosterPdf(
  company: PosterCompany,
  companyRef: CompanyCareerRef,
  jobs: PosterJob[]
): Promise<Buffer> {
  if (jobs.length === 0) {
    throw new Error('No open positions');
  }

  const primary = company.primaryColor || '#1e3a5f';
  const accent = company.accentColor || '#3b82f6';
  const qrUrl = getCompanyQrCareerUrl(companyRef);
  const shortUrl = getShortCareerDisplayUrl(companyRef);
  const qrBuffer = await generateQrPngBuffer(qrUrl);
  const qrDataUrl = `data:image/png;base64,${qrBuffer.toString('base64')}`;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentW = pageW - margin * 2;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, 'F');

  setFill(doc, primary);
  doc.rect(0, 0, pageW, 8, 'F');

  let y = 28;

  if (company.logoUrl) {
    const logoData = await loadImageDataUrl(company.logoUrl);
    if (logoData) {
      try {
        const logoW = 96;
        const logoH = 44;
        doc.addImage(logoData, 'PNG', (pageW - logoW) / 2, y, logoW, logoH);
        y += logoH + 10;
      } catch {
        y += 4;
      }
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  setText(doc, '#1a1a1a');
  doc.text(company.name, pageW / 2, y, { align: 'center' });
  y += 20;

  if (company.address?.trim()) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    setText(doc, '#666666');
    const addressLines = doc.splitTextToSize(company.address.trim(), contentW - 40);
    doc.text(addressLines, pageW / 2, y, { align: 'center' });
    y += addressLines.length * 12 + 6;
  }

  setDraw(doc, accent);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  setText(doc, primary);
  doc.text(POSTER_HEADLINE, pageW / 2, y, { align: 'center' });
  y += 26;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  setText(doc, '#444444');
  doc.text(POSTER_SUBHEADLINE, pageW / 2, y, { align: 'center' });
  y += 22;

  const footerY = pageH - 24;
  const shortUrlY = footerY - 12;
  const taglineY = shortUrlY - 14;
  const qrSize = 148;
  const qrY = taglineY - 18 - qrSize;
  const qrLabelY = qrY - 12;
  const benefitsStartY = qrLabelY - 66;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setText(doc, primary);
  doc.text('Open Positions', margin, y);
  const jobsListY = y + 14;

  const displayJobs = jobs.slice(0, 4);
  const cols = displayJobs.length >= 2 ? 2 : 1;
  const gap = 10;
  const cardW = cols === 2 ? (contentW - gap) / 2 : contentW;
  const cardH = 54;
  const maxJobsHeight = benefitsStartY - jobsListY - 8;
  const maxRows = Math.max(1, Math.floor((maxJobsHeight + gap) / (cardH + gap)));
  const jobRows = Math.min(Math.ceil(displayJobs.length / cols), maxRows);
  const jobsToShow = displayJobs.slice(0, jobRows * cols);

  jobsToShow.forEach((job, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = margin + col * (cardW + gap);
    const cardY = jobsListY + row * (cardH + gap);
    drawJobCard(doc, job, x, cardY, cardW, cardH, primary, accent);
  });

  drawBenefits(doc, margin, benefitsStartY, contentW, primary, accent);

  const qrX = (pageW - qrSize) / 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  setText(doc, primary);
  doc.text(POSTER_QR_LABEL, pageW / 2, qrLabelY, { align: 'center' });

  setDraw(doc, accent);
  doc.setLineWidth(1.5);
  doc.roundedRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 8, 8, 'S');
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setText(doc, '#555555');
  doc.text(POSTER_QR_TAGLINE, pageW / 2, taglineY, { align: 'center' });

  doc.setFontSize(8.5);
  setText(doc, '#888888');
  doc.text(shortUrl, pageW / 2, shortUrlY, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setText(doc, '#aaaaaa');
  doc.text(POSTER_FOOTER, pageW / 2, footerY, { align: 'center' });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
