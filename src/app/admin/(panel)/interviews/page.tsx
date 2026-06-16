'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, Video, User } from 'lucide-react';

interface Interview {
  id: number;
  scheduledAt: string;
  notes: string | null;
  meetLink: string | null;
  status: string;
  applicant: { firstName: string; lastName: string; email: string; position: string };
  admin: { email: string; name: string | null };
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/interviews')
      .then((r) => r.json())
      .then((d) => setInterviews(d.interviews || []))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d: string) =>
    new Date(d).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  const upcoming = interviews.filter((i) => new Date(i.scheduledAt) >= new Date() && i.status === 'Scheduled');
  const past = interviews.filter((i) => new Date(i.scheduledAt) < new Date() || i.status !== 'Scheduled');

  return (
    <div className="saas-page">
      <div className="saas-page-header">
        <div>
          <h1>Interviews</h1>
          <p className="saas-subtitle">Scheduled and past interviews</p>
        </div>
      </div>

      {loading ? (
        <div className="saas-loading">Loading interviews...</div>
      ) : interviews.length === 0 ? (
        <div className="saas-empty-state">
          <Calendar size={48} strokeWidth={1} />
          <h3>No interviews scheduled</h3>
          <p>Schedule interviews from an applicant&apos;s detail page.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="saas-interview-section">
              <h2>Upcoming</h2>
              <div className="saas-interview-grid">
                {upcoming.map((iv) => <InterviewCard key={iv.id} interview={iv} fmt={fmt} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section className="saas-interview-section">
              <h2>Past</h2>
              <div className="saas-interview-grid">
                {past.map((iv) => <InterviewCard key={iv.id} interview={iv} fmt={fmt} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function InterviewCard({ interview: iv, fmt }: { interview: Interview; fmt: (d: string) => string }) {
  return (
    <div className="saas-card saas-interview-card">
      <div className="saas-interview-time"><Clock size={16} /> {fmt(iv.scheduledAt)}</div>
      <h3>{iv.applicant.firstName} {iv.applicant.lastName}</h3>
      <p className="saas-subtitle">{iv.applicant.position}</p>
      <div className="saas-interview-meta">
        <span><User size={14} /> {iv.applicant.email}</span>
        {iv.meetLink && (
          <a href={iv.meetLink} target="_blank" rel="noopener" className="saas-link">
            <Video size={14} /> Join Meeting
          </a>
        )}
      </div>
      {iv.notes && <p className="saas-interview-notes">{iv.notes}</p>}
    </div>
  );
}
