'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Download, Eye, Trash2, Calendar, FileText, Save,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { STATUSES, DAYS } from '@/lib/constants';
import { toast } from 'sonner';

interface Applicant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  position: string;
  employmentType: string;
  authorizedToWork: boolean;
  over18: boolean;
  customerServiceExperience: boolean;
  upsPrintShippingExperience: boolean;
  availableStartDate: string;
  availabilityJson: Record<string, string>;
  previousEmployer: string | null;
  previousJobTitle: string | null;
  previousStartDate: string | null;
  previousEndDate: string | null;
  reasonForLeaving: string | null;
  whyWorkHere: string;
  resumeFilename: string | null;
  resumeUrl: string | null;
  status: string;
  notes: string;
  createdAt: string;
}

interface NoteRecord {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  admin: { email: string; name: string | null };
}

export default function ApplicantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [noteRecord, setNoteRecord] = useState<NoteRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [noteStatus, setNoteStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [showDelete, setShowDelete] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/applicants/${id}`).then((r) => r.json()),
      fetch(`/api/admin/applicants/${id}/notes`).then((r) => r.json()),
    ]).then(([appData, notesData]) => {
      if (appData.applicant) {
        setApplicant(appData.applicant);
        setNotes(appData.applicant.notes || '');
      }
      if (notesData.notes?.[0]) setNoteRecord(notesData.notes[0]);
    }).finally(() => setLoading(false));
  }, [id]);

  const saveNotes = useCallback(async (content: string) => {
    setNoteStatus('saving');
    const res = await fetch(`/api/admin/applicants/${id}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: content }),
    });
    const data = await res.json();
    if (res.ok) {
      setNoteRecord(data.note);
      setNoteStatus('saved');
      setTimeout(() => setNoteStatus('idle'), 2000);
    } else {
      setNoteStatus('idle');
      toast.error('Failed to save notes');
    }
  }, [id]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNotes(value), 1000);
  };

  const handleStatusChange = async (status: string) => {
    const res = await fetch(`/api/admin/applicants/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) {
      setApplicant(data.applicant);
      toast.success(`Status updated to ${status}`);
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/admin/applicants/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Applicant deleted');
      router.push('/admin/applicants');
    } else {
      toast.error('Failed to delete');
    }
  };

  const scheduleInterview = async () => {
    if (!interviewDate) { toast.error('Select a date and time'); return; }
    const res = await fetch('/api/admin/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicantId: parseInt(id, 10),
        scheduledAt: new Date(interviewDate).toISOString(),
        notes: interviewNotes || null,
        meetLink: meetLink || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setShowInterview(false);
      setApplicant((prev) => (prev ? { ...prev, status: 'Interview' } : prev));
      if (data.email?.sent) {
        toast.success('Interview scheduled and email sent');
      } else if (data.email?.emailStatus === 'not_configured') {
        toast.success('Interview scheduled (email not configured)');
      } else {
        toast.success('Interview scheduled');
        toast.error(data.email?.reason || 'Failed to send interview email');
      }
    } else {
      toast.error('Failed to schedule interview');
    }
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  const fmtTime = (d: string) =>
    new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  if (loading) return <div className="saas-loading">Loading applicant...</div>;
  if (!applicant) return <div className="saas-empty-state"><p>Applicant not found</p></div>;

  const availability = applicant.availabilityJson || {};
  const resumeViewUrl = applicant.resumeUrl || `/api/admin/applicants/${id}/resume`;

  return (
    <div className="saas-page">
      <Link href="/admin/applicants" className="saas-back-link"><ArrowLeft size={16} /> Back to Applicants</Link>

      <div className="saas-detail-header">
        <div className="saas-applicant-cell">
          <div className="saas-avatar saas-avatar-lg">
            {applicant.firstName[0]}{applicant.lastName[0]}
          </div>
          <div>
            <h1>{applicant.firstName} {applicant.lastName}</h1>
            <p className="saas-subtitle">{applicant.position} · Applied {fmtTime(applicant.createdAt)}</p>
          </div>
        </div>
        <StatusBadge status={applicant.status} />
      </div>

      <div className="saas-detail-grid">
        <div className="saas-detail-main">
          <Section title="Personal Information">
            <InfoGrid items={[
              ['Email', applicant.email], ['Phone', applicant.phone],
              ['Address', `${applicant.address}, ${applicant.city}, ${applicant.state} ${applicant.zip}`],
            ]} />
          </Section>

          <Section title="Job Information">
            <InfoGrid items={[
              ['Position', applicant.position], ['Employment Type', applicant.employmentType],
              ['Available Start', fmt(applicant.availableStartDate)],
              ['Authorized to Work', applicant.authorizedToWork ? 'Yes' : 'No'],
              ['18+ Years Old', applicant.over18 ? 'Yes' : 'No'],
              ['Customer Service Exp.', applicant.customerServiceExperience ? 'Yes' : 'No'],
              ['Retail/Shipping Exp.', applicant.upsPrintShippingExperience ? 'Yes' : 'No'],
            ]} />
          </Section>

          <Section title="Availability">
            <InfoGrid items={DAYS.map((d) => [d, availability[d] || 'Not available'])} />
          </Section>

          <Section title="Work History">
            <InfoGrid items={[
              ['Previous Employer', applicant.previousEmployer || '—'],
              ['Job Title', applicant.previousJobTitle || '—'],
              ['Start Date', fmt(applicant.previousStartDate)],
              ['End Date', fmt(applicant.previousEndDate)],
              ['Reason for Leaving', applicant.reasonForLeaving || '—'],
            ]} />
          </Section>

          <Section title="Why They Want to Work Here">
            <p className="saas-detail-text">{applicant.whyWorkHere}</p>
          </Section>

          {applicant.resumeFilename && (
            <Section title="Resume">
              <div className="saas-resume-actions">
                <button type="button" className="saas-btn saas-btn-outline saas-btn-sm" onClick={() => setShowResume(true)}>
                  <Eye size={16} /> View Resume
                </button>
                <a href={`/api/admin/applicants/${id}/resume`} className="saas-btn saas-btn-outline saas-btn-sm" download>
                  <Download size={16} /> Download
                </a>
              </div>
              {showResume && (
                <div className="saas-resume-viewer">
                  <iframe src={resumeViewUrl} title="Resume" />
                  <button type="button" className="saas-btn saas-btn-ghost saas-btn-sm" onClick={() => setShowResume(false)}>Close</button>
                </div>
              )}
            </Section>
          )}
        </div>

        <div className="saas-detail-sidebar">
          <div className="saas-card">
            <h3>Actions</h3>
            <div className="saas-status-buttons">
              {STATUSES.map((s) => (
                <button key={s} type="button" className={`saas-status-btn ${applicant.status === s ? 'active' : ''}`} onClick={() => handleStatusChange(s)} disabled={applicant.status === s}>
                  {s}
                </button>
              ))}
            </div>
            <button type="button" className="saas-btn saas-btn-primary saas-btn-block" style={{ marginTop: '0.75rem' }} onClick={() => setShowInterview(true)}>
              <Calendar size={16} /> Schedule Interview
            </button>
          </div>

          <div className="saas-card">
            <div className="saas-notes-header">
              <h3>Internal Notes</h3>
              <span className="saas-note-status">
                {noteStatus === 'saving' && 'Saving...'}
                {noteStatus === 'saved' && <><Save size={12} /> Saved</>}
              </span>
            </div>
            <textarea rows={6} value={notes} onChange={(e) => handleNotesChange(e.target.value)} placeholder="Notes auto-save as you type..." className="saas-notes-textarea" />
            {noteRecord && (
              <div className="saas-note-meta">
                <span>By {noteRecord.admin.name || noteRecord.admin.email}</span>
                <span>Created {fmtTime(noteRecord.createdAt)}</span>
                {noteRecord.updatedAt !== noteRecord.createdAt && (
                  <span>Edited {fmtTime(noteRecord.updatedAt)}</span>
                )}
              </div>
            )}
          </div>

          <div className="saas-card saas-danger-card">
            <h3>Danger Zone</h3>
            {!showDelete ? (
              <button type="button" className="saas-btn saas-btn-danger saas-btn-block" onClick={() => setShowDelete(true)}>
                <Trash2 size={16} /> Delete Applicant
              </button>
            ) : (
              <div>
                <p className="saas-confirm-text">This cannot be undone.</p>
                <div className="saas-confirm-actions">
                  <button type="button" className="saas-btn saas-btn-danger saas-btn-sm" onClick={handleDelete}>Yes, Delete</button>
                  <button type="button" className="saas-btn saas-btn-ghost saas-btn-sm" onClick={() => setShowDelete(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showInterview && (
        <div className="saas-modal-overlay" onClick={() => setShowInterview(false)}>
          <div className="saas-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Schedule Interview</h3>
            <div className="saas-form-group">
              <label>Date & Time</label>
              <input type="datetime-local" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} />
            </div>
            <div className="saas-form-group">
              <label>Google Meet Link (optional)</label>
              <input type="url" value={meetLink} onChange={(e) => setMeetLink(e.target.value)} placeholder="https://meet.google.com/..." />
            </div>
            <div className="saas-form-group">
              <label>Notes</label>
              <textarea rows={3} value={interviewNotes} onChange={(e) => setInterviewNotes(e.target.value)} />
            </div>
            <div className="saas-confirm-actions">
              <button type="button" className="saas-btn saas-btn-primary" onClick={scheduleInterview}>Schedule & Email</button>
              <button type="button" className="saas-btn saas-btn-ghost" onClick={() => setShowInterview(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="saas-card saas-detail-section"><h3>{title}</h3>{children}</div>;
}

function InfoGrid({ items }: { items: [string, string][] }) {
  return (
    <dl className="saas-info-grid">
      {items.map(([label, value]) => (
        <div key={label} className="saas-info-item">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
