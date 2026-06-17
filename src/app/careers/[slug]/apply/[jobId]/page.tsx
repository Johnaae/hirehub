'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, notFound, useSearchParams } from 'next/navigation';
import { MapPin, Briefcase, ArrowLeft } from 'lucide-react';
import ApplicationForm from '@/components/ApplicationForm';
import { APPLY_SOURCE_STORAGE_KEY, normalizeApplicantSource } from '@/lib/applicant-source';

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

function CareerApplyContent() {
  const { slug, jobId } = useParams<{ slug: string; jobId: string }>();
  const searchParams = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<CompanyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [applySource, setApplySource] = useState('website');

  useEffect(() => {
    const fromQuery = searchParams.get('source');
    if (fromQuery) {
      const normalized = normalizeApplicantSource(fromQuery);
      setApplySource(normalized);
      try {
        sessionStorage.setItem(APPLY_SOURCE_STORAGE_KEY, normalized);
      } catch {
        // ignore
      }
      return;
    }
    try {
      const stored = sessionStorage.getItem(APPLY_SOURCE_STORAGE_KEY);
      if (stored) setApplySource(normalizeApplicantSource(stored));
    } catch {
      // ignore
    }
  }, [searchParams]);

  useEffect(() => {
    if (!slug || !jobId) return;
    fetch(`/api/careers/${slug}/jobs/${jobId}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFoundState(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (d.job && d.company) {
          setJob(d.job);
          setCompany(d.company);
        } else {
          setNotFoundState(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, jobId]);

  useEffect(() => {
    if (company) {
      document.documentElement.style.setProperty('--primary', company.primaryColor);
      document.documentElement.style.setProperty('--accent', company.accentColor);
    }
  }, [company]);

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ padding: '4rem 0' }}>Loading...</div>
      </div>
    );
  }

  if (notFoundState || !job || !company) {
    notFound();
  }

  return (
    <div className="page careers-page">
      <div className="container" style={{ padding: '2rem 0' }}>
        <Link href={`/careers/${slug}`} className="saas-back-link">
          <ArrowLeft size={16} /> Back to {company.storeName} careers
        </Link>
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
          applySource={applySource}
          defaultPosition={job.title}
          defaultEmploymentType={job.employmentType}
        />
      </div>
    </div>
  );
}

export default function CareerApplyPage() {
  return (
    <Suspense fallback={<div className="page"><div className="container" style={{ padding: '4rem 0' }}>Loading...</div></div>}>
      <CareerApplyContent />
    </Suspense>
  );
}
