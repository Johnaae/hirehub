'use client';

import { useEffect, useState, useRef } from 'react';
import { Copy, Download, Printer, QrCode, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface QrMarketingData {
  company: { id: number; name: string; slug: string; logoUrl: string | null };
  careerUrl: string;
  shortUrl: string;
  qrDataUrl: string;
  jobs: Array<{ id: number; title: string; department: string | null }>;
}

export default function QrCodeMarketingPage() {
  const [data, setData] = useState<QrMarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

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
    window.open('/api/admin/marketing/poster?print=1', '_blank');
  };

  if (loading) return <div className="saas-loading">Loading QR code tools...</div>;
  if (!data?.company) return <div className="saas-empty-state"><p>Unable to load marketing data</p></div>;

  return (
    <div className="saas-page qr-marketing-page">
      <div className="saas-page-header">
        <div>
          <p className="saas-breadcrumb">Marketing Tools</p>
          <h1>QR Code</h1>
          <p className="saas-subtitle">Generate a scannable QR code and hiring poster for {data.company.name}</p>
        </div>
      </div>

      <div className="qr-marketing-grid">
        <div className="saas-card qr-marketing-preview">
          <div className="settings-card-header">
            <QrCode size={20} />
            <div>
              <h3>{data.company.name}</h3>
              <p>Scan opens your public careers page</p>
            </div>
          </div>

          <div className="qr-code-preview-wrap" ref={printRef}>
            {data.qrDataUrl && (
              <img src={data.qrDataUrl} alt={`QR code for ${data.company.name} careers`} className="qr-code-image" />
            )}
          </div>

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
            <button type="button" className="saas-btn saas-btn-outline" onClick={downloadPng}>
              <Download size={16} /> Download QR PNG
            </button>
            <button type="button" className="saas-btn saas-btn-outline" onClick={downloadPoster}>
              <Download size={16} /> Download poster PDF
            </button>
            <button type="button" className="saas-btn saas-btn-primary" onClick={printPoster}>
              <Printer size={16} /> Print poster
            </button>
          </div>
        </div>

        <div className="saas-card">
          <h3>Open jobs on poster</h3>
          <p className="field-hint" style={{ marginBottom: '1rem' }}>
            These positions appear on your hiring poster and careers page.
          </p>
          {data.jobs.length === 0 ? (
            <p className="saas-empty-text">No open positions — publish jobs to list them on the poster.</p>
          ) : (
            <ul className="qr-jobs-list">
              {data.jobs.map((job) => (
                <li key={job.id}>
                  <strong>{job.title}</strong>
                  {job.department && <span className="saas-list-meta">{job.department}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
