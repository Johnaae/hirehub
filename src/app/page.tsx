'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, ArrowRight } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import { useConfig } from '@/components/ConfigProvider';

interface Job {
  id: number;
  title: string;
  slug: string;
  department: string | null;
  employmentType: string;
  location: string | null;
  salary: string | null;
  description: string;
}

export default function HomePage() {
  const { config } = useConfig();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <PublicHeader />

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge">Now Hiring</span>
            <h1>Join Our Team</h1>
            <p className="hero-text">
              {config.description || 'We are now accepting applications for friendly, reliable team members.'}
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="public-jobs-title">Open Positions</h2>
          {loading ? (
            <div className="public-jobs-loading">Loading positions...</div>
          ) : jobs.length === 0 ? (
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
                    </div>
                    <p className="public-job-desc">{job.description.slice(0, 160)}...</p>
                  </div>
                  <Link href={`/jobs/${job.slug}`} className="btn btn-primary public-apply-btn">
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
          <p>&copy; {new Date().getFullYear()} {config.storeName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
