'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronRight,
  Clock3,
  Plus,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { APPLICANT_SOURCES, APPLICANT_SOURCE_LABELS, type ApplicantSource } from '@/lib/applicant-source';

interface DashboardData {
  stats: Record<string, number>;
  openJobs?: number;
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

const PIPELINE_STATUSES = ['New', 'Reviewing', 'Interview', 'Hired', 'Rejected'] as const;

const SOURCE_COLORS: Record<ApplicantSource, string> = {
  website: '#42658B',
  qr: '#50877D',
  facebook: '#91A9C0',
  indeed: '#172B4D',
  other: '#CBD5E1',
};

const CHART_WIDTH = 700;
const CHART_HEIGHT = 180;

function Skeleton({ className }: { className?: string }) {
  return <div className={`saas-skeleton ${className || ''}`} />;
}

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function percent(part: number, total: number) {
  return total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0;
}

function dayKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDayLabel(key: string) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function buildDailySeries(applicantsByDay: DashboardData['applicantsByDay'], now: Date) {
  const counts = new Map(applicantsByDay.map((d) => [d.date, d.count]));
  const keys = new Set(counts.keys());
  for (let day = 1; day <= now.getDate(); day++) {
    keys.add(dayKey(now.getFullYear(), now.getMonth(), day));
  }
  return [...keys].sort().map((date) => ({ date, count: counts.get(date) ?? 0 }));
}

function buildChartPaths(series: { count: number }[], max: number) {
  const values = series.length === 1 ? [series[0], series[0]] : series;
  const points = values.map((d, i) => ({
    x: values.length > 1 ? (i / (values.length - 1)) * CHART_WIDTH : 0,
    y: CHART_HEIGHT - 12 - (max > 0 ? (d.count / max) * (CHART_HEIGHT - 32) : 0),
  }));
  let line = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cx = (points[i - 1].x + points[i].x) / 2;
    line += ` C ${cx} ${points[i - 1].y} ${cx} ${points[i].y} ${points[i].x} ${points[i].y}`;
  }
  return { line, area: `${line} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z` };
}

function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date | null>(null);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(async (r) => {
        const d = await r.json().catch(() => null);
        setData(r.ok && d?.stats ? d : null);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setNow(new Date());
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        const name: string = d.admin?.name || '';
        if (name.trim()) setFirstName(name.trim().split(/\s+/)[0]);
      })
      .catch(() => {});
  }, []);

  const series = useMemo(
    () => (data && now ? buildDailySeries(data.applicantsByDay, now) : []),
    [data, now]
  );

  const fmtTime = (d: string) =>
    new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const header = (
    <>
      <div className="hh-breadcrumb"><span>Workspace</span><b>/</b><strong>Overview</strong></div>
      <div className="hh-welcome-row">
        <div>
          <p className="hh-eyebrow">
            {now ? now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '\u00a0'}
          </p>
          <h1>
            {now ? greetingFor(now) : 'Welcome back'}
            {firstName ? `, ${firstName}` : ''} <span>—</span>
          </h1>
          <p className="hh-lede">Here&apos;s what&apos;s happening with your hiring today.</p>
        </div>
        <Link href="/admin/jobs?new=1" className="hh-primary-button">
          <Plus aria-hidden="true" /> Post a new job
        </Link>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="hh-dashboard">
        {header}
        <div className="hh-metric-grid">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="hh-metric-card" />)}
        </div>
        <div className="hh-section-grid">
          <Skeleton className="hh-panel hh-skeleton-panel" />
          <Skeleton className="hh-panel hh-skeleton-panel" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="hh-dashboard">
        {header}
        <div className="saas-card saas-empty-state">
          <p>Failed to load dashboard data.</p>
        </div>
      </div>
    );
  }

  const { stats } = data;
  const total = stats.Total ?? 0;
  const monthTotal = series.reduce((sum, d) => sum + d.count, 0);
  const lastWeek = series.slice(-7);
  const weekMax = Math.max(1, ...lastWeek.map((d) => d.count));

  const seriesMax = Math.max(0, ...series.map((d) => d.count));
  const chartMax = Math.max(4, Math.ceil(seriesMax / 4) * 4);
  const chart = series.length > 0 ? buildChartPaths(series, chartMax) : null;
  const yLabels = [chartMax, (chartMax * 3) / 4, chartMax / 2, chartMax / 4, 0];
  const xLabels = series.length > 0
    ? Array.from(new Set([0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * (series.length - 1))))).map((i) => series[i].date)
    : [];

  const sourceTotal = APPLICANT_SOURCES.reduce((sum, s) => sum + (data.applicantsBySource[s] ?? 0), 0);
  let offset = 0;
  const donutStops = APPLICANT_SOURCES
    .filter((s) => (data.applicantsBySource[s] ?? 0) > 0)
    .map((s) => {
      const start = offset;
      offset += ((data.applicantsBySource[s] ?? 0) / sourceTotal) * 100;
      return `${SOURCE_COLORS[s]} ${start}% ${offset}%`;
    });
  const donutBackground = donutStops.length > 0 ? `conic-gradient(${donutStops.join(', ')})` : undefined;

  const positionMax = Math.max(1, ...data.applicantsByPosition.map((p) => p.count));

  return (
    <div className="hh-dashboard">
      {header}

      <div className="hh-metric-grid">
        <article className="hh-metric-card">
          <div className="hh-metric-head"><span>Total applicants</span><span className="hh-metric-icon"><UsersRound aria-hidden="true" /></span></div>
          <strong>{total}</strong>
          <p><span className="hh-trend-up">+{monthTotal}</span> <span>this month</span></p>
          <div className="hh-metric-sparkline" aria-hidden="true">
            {lastWeek.map((d) => <i key={d.date} style={{ height: `${Math.max(3, (d.count / weekMax) * 29)}px` }} />)}
          </div>
        </article>
        <article className="hh-metric-card">
          <div className="hh-metric-head"><span>New applicants</span><span className="hh-metric-icon"><Sparkles aria-hidden="true" /></span></div>
          <strong>{stats.New ?? 0}</strong>
          <p>
            {data.todayNew > 0
              ? <><span className="hh-trend-up">+{data.todayNew}</span> <span>today</span></>
              : <span>Awaiting first review</span>}
          </p>
          <div className="hh-metric-progress" aria-hidden="true"><i style={{ width: `${percent(stats.New ?? 0, total)}%` }} /></div>
        </article>
        <article className="hh-metric-card">
          <div className="hh-metric-head"><span>In review</span><span className="hh-metric-icon"><Clock3 aria-hidden="true" /></span></div>
          <strong>{stats.Reviewing ?? 0}</strong>
          <p><span>{stats.Interview ?? 0} in interview stage</span></p>
          <div className="hh-metric-progress" aria-hidden="true"><i style={{ width: `${percent(stats.Reviewing ?? 0, total)}%` }} /></div>
        </article>
        <article className="hh-metric-card">
          <div className="hh-metric-head"><span>Hired</span><span className="hh-metric-icon"><BriefcaseBusiness aria-hidden="true" /></span></div>
          <strong>{stats.Hired ?? 0}</strong>
          <p>
            <span>
              {typeof data.openJobs === 'number'
                ? `${data.openJobs} open ${data.openJobs === 1 ? 'role' : 'roles'}`
                : 'Build your next team'}
            </span>
          </p>
          <div className="hh-metric-progress" aria-hidden="true"><i style={{ width: `${percent(stats.Hired ?? 0, total)}%` }} /></div>
        </article>
      </div>

      <div className="hh-section-grid">
        <article className="hh-panel">
          <div className="hh-panel-heading">
            <div><h2>Applicant activity</h2><p>New applications this month</p></div>
          </div>
          <div className="hh-chart-area">
            <div className="hh-chart-y-labels">{yLabels.map((v) => <span key={v}>{v}</span>)}</div>
            <div className="hh-chart">
              <div className="hh-chart-grid">{yLabels.map((v) => <i key={v} />)}</div>
              {chart && (
                <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none" role="img" aria-label="Applications per day this month">
                  <defs>
                    <linearGradient id="hhChartFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#B8C9DA" stopOpacity=".55" />
                      <stop offset="100%" stopColor="#B8C9DA" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={chart.area} fill="url(#hhChartFill)" />
                  <path d={chart.line} fill="none" className="hh-chart-line" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
              )}
              <div className="hh-chart-x-labels">{xLabels.map((key) => <span key={key}>{formatDayLabel(key)}</span>)}</div>
            </div>
          </div>
        </article>

        <article className="hh-panel">
          <div className="hh-panel-heading">
            <div><h2>Application sources</h2><p>Where your candidates found you</p></div>
          </div>
          <div className="hh-donut-wrap">
            <div className="hh-donut" style={donutBackground ? { background: donutBackground } : undefined}>
              <div><strong>{sourceTotal}</strong><span>Total</span></div>
            </div>
            <div className="hh-source-legend">
              {APPLICANT_SOURCES.map((s) => (
                <span key={s}>
                  <i style={{ background: SOURCE_COLORS[s] }} />
                  {APPLICANT_SOURCE_LABELS[s]} <b>{data.applicantsBySource[s] ?? 0}</b>
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>

      <article className="hh-panel hh-applicants-panel">
        <div className="hh-panel-heading">
          <div><h2>Recent applicants</h2><p>Keep your candidate pipeline moving</p></div>
          <Link href="/admin/applicants" className="hh-view-all">View all applicants <ArrowUpRight aria-hidden="true" /></Link>
        </div>
        {data.recentApplicants.length === 0 ? (
          <p className="saas-empty-text">No applications yet</p>
        ) : (
          <div className="hh-applicant-table">
            <div className="hh-applicant-table-head"><span>Candidate</span><span>Applied for</span><span>Applied</span><span>Status</span><span /></div>
            {data.recentApplicants.map((a) => (
              <Link href={`/admin/applicants/${a.id}`} className="hh-applicant-row" key={a.id}>
                <div className="hh-candidate-cell">
                  <div className="hh-avatar">{initials(a.firstName, a.lastName)}</div>
                  <strong>{a.firstName} {a.lastName}</strong>
                </div>
                <span>{a.position}</span>
                <span title={fmtDate(a.createdAt)}>{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</span>
                <span><em className={`hh-status hh-status-${a.status.toLowerCase()}`}>{a.status}</em></span>
                <ChevronRight aria-hidden="true" className="hh-row-chevron" />
              </Link>
            ))}
          </div>
        )}
      </article>

      <div className="hh-section-grid hh-section-grid-even">
        <article className="hh-panel">
          <div className="hh-panel-heading">
            <div><h2>Pipeline by status</h2><p>Where every applicant stands</p></div>
          </div>
          <div className="hh-bar-list">
            {PIPELINE_STATUSES.map((status) => (
              <div className="hh-bar-row" key={status}>
                <span>{status}</span>
                <div className="hh-bar-track"><i style={{ width: `${percent(stats[status] ?? 0, total)}%` }} /></div>
                <b>{stats[status] ?? 0}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="hh-panel">
          <div className="hh-panel-heading">
            <div><h2>Top positions</h2><p>Roles attracting the most applicants</p></div>
          </div>
          {data.applicantsByPosition.length === 0 ? (
            <p className="saas-empty-text">No applications yet</p>
          ) : (
            <div className="hh-bar-list">
              {data.applicantsByPosition.map((p) => (
                <div className="hh-bar-row" key={p.position}>
                  <span title={p.position}>{p.position}</span>
                  <div className="hh-bar-track"><i style={{ width: `${percent(p.count, positionMax)}%` }} /></div>
                  <b>{p.count}</b>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>

      <div className="hh-section-grid hh-section-grid-thirds">
        <article className="hh-panel">
          <div className="hh-panel-heading">
            <div><h2>Upcoming interviews</h2><p>Your next conversations</p></div>
            <Link href="/admin/interviews" className="hh-view-all">View all <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          {data.upcomingInterviews.length === 0 ? (
            <p className="saas-empty-text">No upcoming interviews</p>
          ) : (
            <ul className="hh-list">
              {data.upcomingInterviews.map((iv) => (
                <li key={iv.id}>
                  <div className="hh-avatar">{initials(iv.applicant.firstName, iv.applicant.lastName)}</div>
                  <div className="hh-list-text">
                    <strong>{iv.applicant.firstName} {iv.applicant.lastName}</strong>
                    <small>{iv.applicant.position}</small>
                  </div>
                  <span className="hh-list-meta">{fmtTime(iv.scheduledAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="hh-panel">
          <div className="hh-panel-heading">
            <div><h2>Recent hires</h2><p>Welcome to the team</p></div>
          </div>
          {data.recentHires.length === 0 ? (
            <p className="saas-empty-text">No hires yet</p>
          ) : (
            <ul className="hh-list">
              {data.recentHires.map((h) => (
                <li key={h.id}>
                  <Link href={`/admin/applicants/${h.id}`} className="hh-list-link">
                    <div className="hh-avatar">{initials(h.firstName, h.lastName)}</div>
                    <div className="hh-list-text">
                      <strong>{h.firstName} {h.lastName}</strong>
                      <small>{h.position}</small>
                    </div>
                    <span className="hh-list-meta">{fmtDate(h.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="hh-panel">
          <div className="hh-panel-heading">
            <div><h2>Activity timeline</h2><p>Latest updates from your team</p></div>
          </div>
          {data.recentActivity.length === 0 ? (
            <p className="saas-empty-text">No activity yet</p>
          ) : (
            <ul className="hh-timeline">
              {data.recentActivity.map((a) => (
                <li key={a.id}>
                  <i aria-hidden="true" />
                  <div>
                    <strong>{a.action}</strong>
                    {a.details && <p>{a.details}</p>}
                    <small>{fmtTime(a.createdAt)}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </div>
  );
}
