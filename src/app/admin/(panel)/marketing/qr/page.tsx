'use client';

import { useEffect, useState } from 'react';
import { Copy, Download, Printer, QrCode, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import HiringPosterPreview from '@/components/admin/HiringPosterPreview';

interface QrMarketingData {
  company: {
    id: number;
    name: string;
    slug: string;
    logoUrl: string | null;
    address: string | null;
    primaryColor: string | null;
    accentColor: string | null;
  };
  careerUrl: string;
  shortUrl: string;
  qrDataUrl: string | null;
  jobs: Array<{
    id: number;
    title: string;
    department: string | null;
    employmentType: string | null;
    salary: string | null;
  }>;
}

export default function QrCodeMarketingPage() {
  const [data, setData] = useState<QrMarketingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/marketing/qr')
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const copyLink = () => {
    if (!data?.careerUrl) return;
    navigator.clipboard.writeText(data.careerUrl);
    toast.success('Career link copied');
  };

  const downloadPng = () => {
    window.location.href = '/api/admin/marketing/qr/png';
  };

  const downloadPoster = () => {
    window.location.href = '/api/admin/marketing/poster';
  };

  const printPoster = () => {
    window.print();
  };

  if (loading) return <div className="saas-loading">Loading QR code tools...</div>;
  if (!data?.company) return <div className="saas-empty-state"><p>Unable to load marketing data</p></div>;

  const hasOpenJobs = data.jobs.length > 0;

  return (
    <div className="saas-page qr-marketing-page">
      <div className="saas-page-header qr-marketing-no-print">
        <div>
          <p className="saas-breadcrumb">Marketing Tools</p>
          <h1>QR Code &amp; Hiring Poster</h1>
          <p className="saas-subtitle">
            Print-ready flyer for {data.company.name} — tape it on your door or share digitally
          </p>
        </div>
      </div>

      <div className="qr-marketing-layout">
        <div className="qr-marketing-poster-column">
          <div className="saas-card hiring-poster-card">
            <div className="hiring-poster-card-header qr-marketing-no-print">
              <div>
                <h3>Poster preview</h3>
                <p className="field-hint">US Letter (8.5&quot; × 11&quot;) — matches the downloaded PDF</p>
              </div>
              {hasOpenJobs && (
                <div className="qr-poster-actions">
                  <button type="button" className="saas-btn saas-btn-outline saas-btn-sm" onClick={downloadPoster}>
                    <Download size={14} /> Download PDF
                  </button>
                  <button type="button" className="saas-btn saas-btn-primary saas-btn-sm" onClick={printPoster}>
                    <Printer size={14} /> Print poster
                  </button>
                </div>
              )}
            </div>

            <div className="hiring-poster-printable">
              <HiringPosterPreview
                company={data.company}
                jobs={data.jobs}
                qrDataUrl={hasOpenJobs ? data.qrDataUrl : null}
                shortUrl={data.shortUrl}
              />
            </div>
          </div>
        </div>

        <aside className="qr-marketing-sidebar qr-marketing-no-print">
          <div className="saas-card qr-marketing-preview">
            <div className="settings-card-header">
              <QrCode size={20} />
              <div>
                <h3>QR code</h3>
                <p>Scan opens your public careers page</p>
              </div>
            </div>

            {data.qrDataUrl ? (
              <div className="qr-code-preview-wrap">
                <img src={data.qrDataUrl} alt={`QR code for ${data.company.name} careers`} className="qr-code-image" />
              </div>
            ) : (
              <p className="saas-empty-text">Publish an open job to generate a QR code for the poster.</p>
            )}

            <div className="qr-url-block">
              <code>{data.careerUrl}</code>
              <a href={data.careerUrl} target="_blank" rel="noopener noreferrer" className="saas-link">
                <ExternalLink size={14} /> Open
              </a>
            </div>
            <p className="field-hint">Short link: {data.shortUrl}</p>

            <div className="qr-action-buttons">
              <button type="button" className="saas-btn saas-btn-outline" onClick={copyLink}>
                <Copy size={16} /> Copy link
              </button>
              {data.qrDataUrl && (
                <button type="button" className="saas-btn saas-btn-outline" onClick={downloadPng}>
                  <Download size={16} /> Download QR PNG
                </button>
              )}
            </div>
          </div>

          <div className="saas-card">
            <h3>Open jobs on poster</h3>
            <p className="field-hint" style={{ marginBottom: '1rem' }}>
              Up to four positions appear on the printed flyer.
            </p>
            {data.jobs.length === 0 ? (
              <p className="saas-empty-text">No open positions at this time</p>
            ) : (
              <ul className="qr-jobs-list">
                {data.jobs.map((job) => (
                  <li key={job.id}>
                    <strong>{job.title}</strong>
                    <span className="saas-list-meta">
                      {[job.department, job.employmentType, job.salary].filter(Boolean).join(' · ')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
