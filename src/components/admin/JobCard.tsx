'use client';

import {
  MapPin, Briefcase, Users, DollarSign, MoreVertical,
  Pencil, Copy, Archive, Trash2, ExternalLink, Eye, Calendar, UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { getCompanyApplyUrl, type CompanyCareerRef } from '@/lib/company-career';

export interface JobCardData {
  id: number;
  title: string;
  slug: string;
  department: string | null;
  employmentType: string;
  location: string | null;
  salary: string | null;
  status: string;
  openings: number;
  updatedAt?: string;
  hiredCount?: number;
  interviewCount?: number;
  remainingOpenings?: number;
  _count: { applicants: number };
}

const STATUS_STYLES: Record<string, string> = {
  Open: 'open',
  Closed: 'closed',
  Draft: 'draft',
  Archived: 'archived',
  Paused: 'paused',
  Filled: 'filled',
};

interface JobCardProps {
  job: JobCardData;
  companyRef?: CompanyCareerRef | null;
  onEdit: (job: JobCardData) => void;
  onDuplicate: (id: number) => void;
  onArchive: (id: number) => void;
  onDelete: (id: number) => void;
  onPublish: (id: number) => void;
}

export default function JobCard({
  job,
  companyRef,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onPublish,
}: JobCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const publicApplyUrl =
    companyRef && companyRef.id ? getCompanyApplyUrl(companyRef, job.id) : null;

  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  const remaining = job.remainingOpenings ?? Math.max(0, job.openings - (job.hiredCount ?? 0));

  return (
    <article className="ats-job-card">
      <div className="ats-job-card-top">
        <span className={`ats-status-badge ${STATUS_STYLES[job.status] || 'draft'}`}>
          {job.status}
        </span>
        <div className="ats-job-menu-wrap">
          <button type="button" className="ats-icon-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Actions">
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="ats-menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="ats-action-menu">
                <button type="button" onClick={() => { onEdit(job); setMenuOpen(false); }}>
                  <Pencil size={14} /> Edit
                </button>
                <button type="button" onClick={() => { onDuplicate(job.id); setMenuOpen(false); }}>
                  <Copy size={14} /> Duplicate
                </button>
                {job.status === 'Open' && publicApplyUrl && (
                  <Link href={publicApplyUrl} target="_blank" onClick={() => setMenuOpen(false)}>
                    <ExternalLink size={14} /> View public page
                  </Link>
                )}
                {job.status === 'Draft' && (
                  <button type="button" onClick={() => { onPublish(job.id); setMenuOpen(false); }}>
                    <Eye size={14} /> Publish
                  </button>
                )}
                {job.status !== 'Archived' && (
                  <button type="button" onClick={() => { onArchive(job.id); setMenuOpen(false); }}>
                    <Archive size={14} /> Archive
                  </button>
                )}
                <button type="button" className="danger" onClick={() => { onDelete(job.id); setMenuOpen(false); }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <h3 className="ats-job-title">{job.title}</h3>
      {job.department && <span className="ats-job-dept">{job.department}</span>}

      <div className="ats-job-meta">
        {job.location && <span><MapPin size={14} /> {job.location}</span>}
        <span><Briefcase size={14} /> {job.employmentType}</span>
        {job.salary && <span><DollarSign size={14} /> {job.salary}</span>}
        <span><Users size={14} /> {job._count.applicants} applicants</span>
        <span><Calendar size={14} /> {job.interviewCount ?? 0} interviews</span>
        <span><UserCheck size={14} /> {job.hiredCount ?? 0} hired</span>
        <span>{job.openings} opening{job.openings !== 1 ? 's' : ''} · {remaining} remaining</span>
      </div>

      {job.updatedAt && (
        <p className="ats-job-updated">Updated {fmt(job.updatedAt)}</p>
      )}

      <div className="ats-job-card-actions">
        <button type="button" className="saas-btn saas-btn-outline saas-btn-sm" onClick={() => onEdit(job)}>
          Edit Job
        </button>
        {job.status === 'Open' && publicApplyUrl && (
          <Link href={publicApplyUrl} target="_blank" className="saas-btn saas-btn-ghost saas-btn-sm">
            View Listing
          </Link>
        )}
      </div>
    </article>
  );
}
