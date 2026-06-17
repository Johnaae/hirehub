'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCards from '@/components/admin/StatCards';
import DashboardCharts from '@/components/admin/DashboardCharts';
import ApplicantsBySourceCard from '@/components/admin/ApplicantsBySourceCard';
import StatusBadge from '@/components/StatusBadge';
import type { ApplicantSource } from '@/lib/applicant-source';

interface DashboardData {
  stats: Record<string, number>;
  todayNew: number;
  applicantsByDay: { date: string; count: number }[];
  applicantsByStatus: { status: string; count: number }[];
  applicantsByPosition: { position: string; count: number }[];
  applicantsBySource: Record<ApplicantSource, number>;
  recentApplicants: Array<{
    id: number; firstName: string; lastName: string;
    position: string; status: string; createdAt: string;
  }>;
  upcomingInterviews: Array<{
    id: number; scheduledAt: string;
    applicant: { firstName: string; lastName: string; position: string };
  }>;
  recentHires: Array<{
    id: number; firstName: string; lastName: string;
    position: string; updatedAt: string;
  }>;
  recentActivity: Array<{
    id: number; action: string; details: string | null; createdAt: string;
    admin: { email: string; name: string | null } | null;
  }>;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`saas-skeleton ${className || ''}`} />;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const fmtTime = (d: string) =>
    new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <div className="saas-page">
      <div className="saas-page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="saas-subtitle">Overview of your hiring pipeline</p>
        </div>
      </div>

      {loading ? (
        <div className="saas-stat-grid">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="saas-stat-card" />)}
        </div>
      ) : data ? (
        <>
          <StatCards stats={data.stats} todayNew={data.todayNew} />
          <div className="saas-dashboard-top-row">
            <ApplicantsBySourceCard applicantsBySource={data.applicantsBySource} />
          </div>
          <DashboardCharts
            applicantsByDay={data.applicantsByDay}
            applicantsByStatus={data.applicantsByStatus}
            applicantsByPosition={data.applicantsByPosition}
          />

          <div className="saas-dashboard-grid">
            <div className="saas-card">
              <div className="saas-card-header">
                <h3>Recent Applicants</h3>
                <Link href="/admin/applicants" className="saas-link">View all</Link>
              </div>
              {data.recentApplicants.length === 0 ? (
                <p className="saas-empty-text">No applications yet</p>
              ) : (
                <ul className="saas-list">
                  {data.recentApplicants.map((a) => (
                    <li key={a.id}>
                      <Link href={`/admin/applicants/${a.id}`} className="saas-list-item">
                        <div>
                          <strong>{a.firstName} {a.lastName}</strong>
                          <span className="saas-list-meta">{a.position}</span>
                        </div>
                        <div className="saas-list-right">
                          <StatusBadge status={a.status} />
                          <span className="saas-list-date">{fmt(a.createdAt)}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="saas-card">
              <div className="saas-card-header">
                <h3>Upcoming Interviews</h3>
                <Link href="/admin/interviews" className="saas-link">View all</Link>
              </div>
              {data.upcomingInterviews.length === 0 ? (
                <p className="saas-empty-text">No upcoming interviews</p>
              ) : (
                <ul className="saas-list">
                  {data.upcomingInterviews.map((iv) => (
                    <li key={iv.id} className="saas-list-item-static">
                      <div>
                        <strong>{iv.applicant.firstName} {iv.applicant.lastName}</strong>
                        <span className="saas-list-meta">{iv.applicant.position}</span>
                      </div>
                      <span className="saas-list-date">{fmtTime(iv.scheduledAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="saas-card">
              <div className="saas-card-header">
                <h3>Recent Hires</h3>
              </div>
              {data.recentHires.length === 0 ? (
                <p className="saas-empty-text">No hires yet</p>
              ) : (
                <ul className="saas-list">
                  {data.recentHires.map((h) => (
                    <li key={h.id}>
                      <Link href={`/admin/applicants/${h.id}`} className="saas-list-item">
                        <div>
                          <strong>{h.firstName} {h.lastName}</strong>
                          <span className="saas-list-meta">{h.position}</span>
                        </div>
                        <span className="saas-list-date">{fmt(h.updatedAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="saas-card">
              <div className="saas-card-header">
                <h3>Activity Timeline</h3>
              </div>
              {data.recentActivity.length === 0 ? (
                <p className="saas-empty-text">No activity yet</p>
              ) : (
                <ul className="saas-timeline">
                  {data.recentActivity.map((a) => (
                    <li key={a.id} className="saas-timeline-item">
                      <div className="saas-timeline-dot" />
                      <div>
                        <strong>{a.action}</strong>
                        {a.details && <p className="saas-list-meta">{a.details}</p>}
                        <span className="saas-list-date">{fmtTime(a.createdAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="saas-card saas-empty-state">
          <p>Failed to load dashboard data.</p>
        </div>
      )}
    </div>
  );
}
