import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireActiveTenant } from '@/lib/auth';
import { tenantWhere } from '@/lib/tenant';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  const auth = await requireActiveTenant();
  if ('error' in auth) return auth.error;
  const { companyId } = auth;

  const format = request.nextUrl.searchParams.get('format') || 'csv';

  const applicants = await prisma.applicant.findMany({
    where: tenantWhere(companyId),
    orderBy: { createdAt: 'desc' },
  });

  const rows = applicants.map((a) => ({
    ID: a.id,
    'First Name': a.firstName,
    'Last Name': a.lastName,
    Email: a.email,
    Phone: a.phone,
    Position: a.position,
    'Employment Type': a.employmentType,
    Status: a.status,
    City: a.city,
    State: a.state,
    'Applied Date': a.createdAt.toISOString().split('T')[0],
  }));

  if (format === 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applicants');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="applicants.xlsx"',
      },
    });
  }

  if (format === 'pdf') {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('Applicants Export', 14, 15);
    autoTable(doc, {
      head: [['Name', 'Email', 'Phone', 'Position', 'Status', 'Applied']],
      body: applicants.map((a) => [
        `${a.firstName} ${a.lastName}`,
        a.email,
        a.phone,
        a.position,
        a.status,
        a.createdAt.toISOString().split('T')[0],
      ]),
      startY: 22,
      styles: { fontSize: 8 },
    });
    const pdfBuf = Buffer.from(doc.output('arraybuffer'));
    return new NextResponse(pdfBuf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="applicants.pdf"',
      },
    });
  }

  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => `"${String((r as Record<string, unknown>)[h] ?? '').toString().replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="applicants.csv"',
    },
  });
}
