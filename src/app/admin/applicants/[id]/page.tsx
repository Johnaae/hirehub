'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { STATUSES, DAYS } from '@/lib/constants';

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

export default function ApplicantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/me').then((r) => r.json()).then((d) => d.admin && setAdminEmail(d.admin.email));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/applicants/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setApplicant(data.applicant);
        setNotes(data.applicant.notes || '');
      })
      .catch((err) => setError(err.message || 'Failed to load applicant'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status: string) => {
    setUpdatingStatus(true);
    setActionMessage('');
    try {
      const response = await fetch(`/api/admin/applicants/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setApplicant(data.applicant);
      setActionMessage('Status updated successfully.');
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setActionMessage('');
    try {
      const response = await fetch(`/api/admin/applicants/${id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setApplicant(data.applicant);
      setActionMessage('Notes saved successfully.');
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/applicants/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      router.push('/admin');
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to delete applicant');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  if (loading) {
    return (
      <div className="page admin-page">
        <AdminHeader adminEmail={adminEmail} />
        <div className="loading-container"><LoadingSpinner size="lg" /></div>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="page admin-page">
        <AdminHeader adminEmail={adminEmail} />
        <div className="container">
          <div className="alert alert-error">{error || 'Applicant not found'}</div>
          <Link href="/admin" className="btn btn-primary">&larr; Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const availability = applicant.availabilityJson || {};

  return (
    <div className="page admin-page">
      <AdminHeader adminEmail={adminEmail} />
      <main className="admin-main">
        <div className="container container-wide">
          <Link href="/admin" className="back-link">&larr; Back to Applicants</Link>

          <div className="detail-header">
            <div>
              <h1>{applicant.firstName} {applicant.lastName}</h1>
              <p className="text-muted">Applied {formatDateTime(applicant.createdAt)}</p>
            </div>
            <StatusBadge status={applicant.status} />
          </div>

          {actionMessage && (
            <div className={`alert ${actionMessage.includes('success') ? 'alert-success' : 'alert-error'}`}>
              {actionMessage}
            </div>
          )}

          <div className="detail-grid">
            <div className="detail-main">
              <section className="detail-section card">
                <h2>Personal Information</h2>
                <dl className="detail-list">
                  <DetailItem label="Email" value={applicant.email} />
                  <DetailItem label="Phone" value={applicant.phone} />
                  <DetailItem label="Address" value={`${applicant.address}, ${applicant.city}, ${applicant.state} ${applicant.zip}`} />
                </dl>
              </section>

              <section className="detail-section card">
                <h2>Position & Eligibility</h2>
                <dl className="detail-list">
                  <DetailItem label="Position" value={applicant.position} />
                  <DetailItem label="Employment Type" value={applicant.employmentType} />
                  <DetailItem label="Available Start Date" value={formatDate(applicant.availableStartDate)} />
                  <DetailItem label="Authorized to Work in US" value={applicant.authorizedToWork ? 'Yes' : 'No'} />
                  <DetailItem label="At Least 18 Years Old" value={applicant.over18 ? 'Yes' : 'No'} />
                  <DetailItem label="Customer Service Experience" value={applicant.customerServiceExperience ? 'Yes' : 'No'} />
                  <DetailItem label="UPS/Print/Shipping/Retail Experience" value={applicant.upsPrintShippingExperience ? 'Yes' : 'No'} />
                </dl>
              </section>

              <section className="detail-section card">
                <h2>Weekly Availability</h2>
                <dl className="detail-list">
                  {DAYS.map((day) => (
                    <DetailItem key={day} label={day} value={availability[day] || 'Not available'} />
                  ))}
                </dl>
              </section>

              <section className="detail-section card">
                <h2>Work History</h2>
                <dl className="detail-list">
                  <DetailItem label="Previous Employer" value={applicant.previousEmployer || '—'} />
                  <DetailItem label="Job Title" value={applicant.previousJobTitle || '—'} />
                  <DetailItem label="Start Date" value={formatDate(applicant.previousStartDate)} />
                  <DetailItem label="End Date" value={formatDate(applicant.previousEndDate)} />
                  <DetailItem label="Reason for Leaving" value={applicant.reasonForLeaving || '—'} />
                </dl>
              </section>

              <section className="detail-section card">
                <h2>Why They Want to Work Here</h2>
                <p className="detail-text">{applicant.whyWorkHere}</p>
              </section>

              {applicant.resumeFilename && (
                <section className="detail-section card">
                  <h2>Resume</h2>
                  <a href={`/api/admin/applicants/${id}/resume`} className="btn btn-outline resume-download" target="_blank" rel="noopener noreferrer">
                    Download {applicant.resumeFilename}
                  </a>
                </section>
              )}
            </div>

            <div className="detail-sidebar">
              <section className="detail-section card">
                <h2>Update Status</h2>
                <div className="status-buttons">
                  {STATUSES.map((s) => (
                    <button key={s} type="button" className={`btn btn-status ${applicant.status === s ? 'active' : ''}`} onClick={() => handleStatusChange(s)} disabled={updatingStatus || applicant.status === s}>
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              <section className="detail-section card">
                <h2>Internal Notes</h2>
                <textarea rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add private notes about this applicant..." />
                <button type="button" className="btn btn-primary btn-block" onClick={handleSaveNotes} disabled={savingNotes} style={{ marginTop: '0.75rem' }}>
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </section>

              <section className="detail-section card danger-zone">
                <h2>Danger Zone</h2>
                {!showDeleteConfirm ? (
                  <button type="button" className="btn btn-danger btn-block" onClick={() => setShowDeleteConfirm(true)}>Delete Applicant</button>
                ) : (
                  <div className="delete-confirm">
                    <p>Are you sure? This action cannot be undone.</p>
                    <div className="delete-actions">
                      <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Yes, Delete'}</button>
                      <button type="button" className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)} disabled={deleting} style={{ color: 'var(--gray-700)' }}>Cancel</button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (<><dt>{label}</dt><dd>{value}</dd></>);
}
