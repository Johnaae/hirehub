'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Briefcase, ArrowLeft } from 'lucide-react';
import ApplicationForm from '@/components/ApplicationForm';

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
  openings: number;
}

interface CompanyConfig {
  storeName: string;
  primaryColor: string;
  accentColor: string;
}

export default function CareerJobApplyPage() {
  const { slug, jobSlug } = useParams<{ slug: string; jobSlug: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<CompanyConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/careers/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.company) {
          setCompany(d.company);
          const found = (d.jobs || []).find((j: Job) => j.slug === jobSlug);
          setJob(found || null);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, jobSlug]);

  useEffect(() => {
    if (company) {
      document.documentElement.style.setProperty('--primary', company.primaryColor);
      document.documentElement.style.setProperty('--accent', company.accentColor);
    }
  }, [company]);

  if (loading) return <div className="page"><div className="container" style={{ padding: '4rem 0' }}>Loading...</div></div>;
  if (!job || !company) return (
    <div className="page">
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Job not found</h2>
        <Link href={`/careers/${slug}`} className="btn btn-primary">View all jobs</Link>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ padding: '2rem 0' }}>
        <Link href={`/careers/${slug}`} className="saas-back-link"><ArrowLeft size={16} /> Back to {company.storeName} careers</Link>
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>{job.title}</h1>
          <div className="public-job-meta">
            {job.location && <span><MapPin size={14} /> {job.location}</span>}
            <span><Briefcase size={14} /> {job.employmentType}</span>
            {job.salary && <span>{job.salary}</span>}
          </div>
          <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{job.description}</div>
        </div>
        <ApplicationForm
          jobId={job.id}
          companySlug={slug}
          defaultPosition={job.title}
          defaultEmploymentType={job.employmentType}
        />
      </div>
    </div>
  );
}
