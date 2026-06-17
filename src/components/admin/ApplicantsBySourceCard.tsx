'use client';

import { APPLICANT_SOURCE_LABELS, type ApplicantSource } from '@/lib/applicant-source';
import { QrCode, Globe, Facebook, Briefcase, MoreHorizontal } from 'lucide-react';

const SOURCE_ICONS: Record<ApplicantSource, typeof QrCode> = {
  qr: QrCode,
  website: Globe,
  facebook: Facebook,
  indeed: Briefcase,
  other: MoreHorizontal,
};

const SOURCE_COLORS: Record<ApplicantSource, { color: string; bg: string }> = {
  qr: { color: '#0f766e', bg: '#ccfbf1' },
  website: { color: '#2563eb', bg: '#dbeafe' },
  facebook: { color: '#1d4ed8', bg: '#dbeafe' },
  indeed: { color: '#b45309', bg: '#fef3c7' },
  other: { color: '#64748b', bg: '#f1f5f9' },
};

export default function ApplicantsBySourceCard({
  applicantsBySource,
}: {
  applicantsBySource: Record<ApplicantSource, number>;
}) {
  const sources = (Object.keys(APPLICANT_SOURCE_LABELS) as ApplicantSource[]);

  return (
    <div className="saas-card applicants-source-card">
      <div className="saas-card-header">
        <h3>Applicants by Source</h3>
      </div>
      <div className="applicants-source-grid">
        {sources.map((source) => {
          const Icon = SOURCE_ICONS[source];
          const { color, bg } = SOURCE_COLORS[source];
          return (
            <div key={source} className="applicants-source-item">
              <div className="applicants-source-icon" style={{ background: bg, color }}>
                <Icon size={18} />
              </div>
              <div>
                <div className="applicants-source-label">{APPLICANT_SOURCE_LABELS[source]}</div>
                <div className="applicants-source-value">{applicantsBySource[source] ?? 0}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
