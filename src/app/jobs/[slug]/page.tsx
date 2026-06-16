'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Briefcase, ArrowLeft } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import ApplicationForm from '@/components/ApplicationForm';
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
  requirements: string | null;
  benefits: string | null;
}

export default function JobApplyPage() {
  const { slug } = useParams<{ slug: string }>();
  const { config } = useConfig();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/jobs/${slug}`)
      .then((r) => r.json())
      .then((d) => setJob(d.job || null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="page"><PublicHeader /><div className="container" style={{ padding: '4rem 0' }}>Loading...</div></div>;
  if (!job) return (
    <div className="page">
      <PublicHeader />
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Job not found</h2>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>View all jobs</Link>
      </div>
    </div>
  );

  return (
    <div className="page">
      <PublicHeader />
      <section className="section">
        <div className="container">
          <Link href="/" className="saas-back-link" style={{ color: 'var(--primary)' }}>
            <ArrowLeft size={16} /> All Positions
          </Link>
          <div className="job-card card" style={{ marginBottom: '2rem' }}>
            {job.department && <span className="public-job-dept">{job.department}</span>}
            <h1 className="job-title">{job.title}</h1>
            <div className="public-job-meta" style={{ marginBottom: '1.5rem' }}>
              {job.location && <span><MapPin size={14} /> {job.location}</span>}
              <span><Briefcase size={14} /> {job.employmentType}</span>
              {job.salary && <span>{job.salary}</span>}
            </div>
            <div className="job-details">
              <div className="job-block">
                <h4>Description</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
              </div>
              {job.requirements && (
                <div className="job-block">
                  <h4>Requirements</h4>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
                </div>
              )}
              {job.benefits && (
                <div className="job-block">
                  <h4>Benefits</h4>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{job.benefits}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="section section-alt">
        <div className="container container-narrow">
          <ApplicationForm jobId={job.id} defaultPosition={job.title} defaultEmploymentType={job.employmentType} />
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
