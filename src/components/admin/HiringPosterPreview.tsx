'use client';

import {
  POSTER_BENEFITS,
  POSTER_FOOTER,
  POSTER_HEADLINE,
  POSTER_NO_JOBS,
  POSTER_QR_LABEL,
  POSTER_QR_TAGLINE,
  POSTER_SUBHEADLINE,
} from '@/lib/hiring-poster-constants';

export interface HiringPosterJob {
  title: string;
  department?: string | null;
  employmentType?: string | null;
  salary?: string | null;
}

export interface HiringPosterCompany {
  name: string;
  logoUrl?: string | null;
  address?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
}

interface HiringPosterPreviewProps {
  company: HiringPosterCompany;
  jobs: HiringPosterJob[];
  qrDataUrl?: string | null;
  shortUrl?: string;
}

export default function HiringPosterPreview({
  company,
  jobs,
  qrDataUrl,
  shortUrl,
}: HiringPosterPreviewProps) {
  const primary = company.primaryColor || '#1e3a5f';
  const accent = company.accentColor || '#3b82f6';
  const hasJobs = jobs.length > 0;

  return (
    <div
      className="hiring-poster-sheet"
      style={
        {
          '--poster-primary': primary,
          '--poster-accent': accent,
        } as React.CSSProperties
      }
    >
      <div className="hiring-poster-accent-bar" aria-hidden />

      <header className="hiring-poster-header">
        {company.logoUrl && (
          <img src={company.logoUrl} alt="" className="hiring-poster-logo" />
        )}
        <h1 className="hiring-poster-company">{company.name}</h1>
        {company.address?.trim() && (
          <p className="hiring-poster-address">{company.address}</p>
        )}
      </header>

      <section className="hiring-poster-headline">
        <h2>{POSTER_HEADLINE}</h2>
        <p>{POSTER_SUBHEADLINE}</p>
      </section>

      {hasJobs ? (
        <>
          <section className="hiring-poster-jobs">
            <h3 className="hiring-poster-section-title">Open Positions</h3>
            <div className="hiring-poster-job-grid">
              {jobs.slice(0, 4).map((job, i) => (
                <article key={`${job.title}-${i}`} className="hiring-poster-job-card">
                  <h4>{job.title}</h4>
                  <div className="hiring-poster-job-meta">
                    {job.department && <span>{job.department}</span>}
                    {job.employmentType && <span>{job.employmentType}</span>}
                  </div>
                  {job.salary?.trim() && (
                    <p className="hiring-poster-job-salary">{job.salary}</p>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="hiring-poster-benefits">
            <h3 className="hiring-poster-section-title">Why Join Us</h3>
            <ul>
              {POSTER_BENEFITS.map((benefit) => (
                <li key={benefit}>
                  <span className="hiring-poster-benefit-check" aria-hidden>✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          {qrDataUrl && (
            <section className="hiring-poster-qr">
              <p className="hiring-poster-qr-label">{POSTER_QR_LABEL}</p>
              <img src={qrDataUrl} alt="QR code to apply" className="hiring-poster-qr-image" />
              <p className="hiring-poster-qr-tagline">{POSTER_QR_TAGLINE}</p>
              {shortUrl && <p className="hiring-poster-short-url">{shortUrl}</p>}
            </section>
          )}
        </>
      ) : (
        <section className="hiring-poster-empty">
          <p>{POSTER_NO_JOBS}</p>
        </section>
      )}

      <footer className="hiring-poster-footer">{POSTER_FOOTER}</footer>
    </div>
  );
}
