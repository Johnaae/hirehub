import { jsPDF } from 'jspdf';
import type { CompanyCareerRef } from './company-career';
import { getCompanyQrCareerUrl, getShortCareerDisplayUrl } from './company-career';
import { generateQrPngBuffer } from './qr-code';

export interface PosterJob {
  title: string;
  department?: string | null;
  employmentType?: string | null;
}

export interface PosterCompany {
  name: string;
  logoUrl?: string | null;
  primaryColor?: string;
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

export async function generateHiringPosterPdf(
  company: PosterCompany,
  companyRef: CompanyCareerRef,
  jobs: PosterJob[]
): Promise<Buffer> {
  const qrUrl = getCompanyQrCareerUrl(companyRef);
  const shortUrl = getShortCareerDisplayUrl(companyRef);
  const qrBuffer = await generateQrPngBuffer(qrUrl);
  const qrDataUrl = `data:image/png;base64,${qrBuffer.toString('base64')}`;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const primary = company.primaryColor || '#1e3a5f';

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, 'F');

  let y = margin;

  if (company.logoUrl) {
    const logoData = await loadImageDataUrl(company.logoUrl);
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', margin, y, 80, 40);
        y += 52;
      } catch {
        y += 8;
      }
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(primary);
  doc.text('NOW HIRING', pageW / 2, y, { align: 'center' });
  y += 36;

  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text(company.name, pageW / 2, y, { align: 'center' });
  y += 32;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text('Open Positions', margin, y);
  y += 18;

  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  const openJobs = jobs.slice(0, 8);
  if (openJobs.length === 0) {
    doc.text('• Check our careers page for the latest openings', margin, y);
    y += 16;
  } else {
    for (const job of openJobs) {
      const line = job.department
        ? `• ${job.title} — ${job.department}`
        : `• ${job.title}`;
      doc.text(line, margin, y);
      y += 16;
      if (y > pageH - 280) break;
    }
  }

  const qrSize = 200;
  const qrX = (pageW - qrSize) / 2;
  const qrY = pageH - margin - qrSize - 72;
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primary);
  doc.text('Scan to Apply', pageW / 2, qrY + qrSize + 24, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(shortUrl, pageW / 2, qrY + qrSize + 42, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Powered by HireHub', pageW / 2, pageH - margin / 2, { align: 'center' });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
