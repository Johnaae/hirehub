'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { MapPin, Briefcase, ArrowRight, Globe, Phone } from 'lucide-react';

interface CareerCompany {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeWebsite: string;
  primaryColor: string;
  accentColor: string;
  heroTitle: string;
  heroSubtitle: string;
  logoUrl: string;
  footer: string;
  companySlug: string;
}

interface CareerJob {
  id: number;
  title: string;
  slug: string;
  department: string | null;
  employmentType: string;
  location: string | null;
  salary: string | null;
  description: string;
  openings: number;
}

export default function CareersPage() {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<CareerCompany | null>(null);
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/careers/${slug}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFoundState(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (d.company) {
          setCompany(d.company);
          setJobs(d.jobs || []);
        } else {
          setNotFoundState(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (company) {
      document.documentElement.style.setProperty('--primary', company.primaryColor);
      document.documentElement.style.setProperty('--accent', company.accentColor);
    }
  }, [company]);

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading careers...</div>
      </div>
    );
  }

  if (notFoundState || !company) {
    notFound();
  }

  return (
    <div className="page careers-page">
      <header className="careers-header" style={{ background: company.primaryColor, color: company.accentColor }}>
        <div className="container careers-header-inner">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.storeName} className="careers-logo" />
          ) : (
            <div className="careers-logo-text">{company.storeName}</div>
          )}
          <nav className="careers-nav">
            {company.storeWebsite && (
              <a href={company.storeWebsite} target="_blank" rel="noopener noreferrer">
                <Globe size={16} /> Website
              </a>
            )}
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge">Now Hiring</span>
            <h1>{company.heroTitle}</h1>
            <p className="hero-text">{company.heroSubtitle}</p>
            {(company.storeAddress || company.storePhone) && (
              <div className="careers-contact">
                {company.storeAddress && <span><MapPin size={14} /> {company.storeAddress}</span>}
                {company.storePhone && <span><Phone size={14} /> {company.storePhone}</span>}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="public-jobs-title">
            Open Positions{jobs.length > 0 ? ` (${jobs.length})` : ''}
          </h2>
          {jobs.length === 0 ? (
            <div className="card public-empty-jobs">
              <p>No open positions at this time. Please check back soon.</p>
            </div>
          ) : (
            <div className="public-jobs-grid">
              {jobs.map((job) => (
                <div key={job.id} className="public-job-card card">
                  <div className="public-job-card-top">
                    {job.department && <span className="public-job-dept">{job.department}</span>}
                    <h3>{job.title}</h3>
                    <div className="public-job-meta">
                      {job.location && <span><MapPin size={14} /> {job.location}</span>}
                      <span><Briefcase size={14} /> {job.employmentType}</span>
                      {job.salary && <span>{job.salary}</span>}
                      {job.openings > 1 && <span>{job.openings} openings</span>}
                    </div>
                    <p className="public-job-desc">{job.description.slice(0, 160)}...</p>
                  </div>
                  <Link href={`/careers/${slug}/apply/${job.id}`} className="btn btn-primary public-apply-btn">
                    Apply Now <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>{company.footer || `© ${new Date().getFullYear()} ${company.storeName}. All rights reserved.`}</p>
        </div>
      </footer>
    </div>
  );
}
