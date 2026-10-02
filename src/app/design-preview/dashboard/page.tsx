'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  Video,
} from 'lucide-react'
import './dashboard-preview.css'

const applicants = [
  { name: 'Jordan Williams', role: 'Assistant Store Manager', initials: 'JW', tone: 'lavender', time: '12 min ago', status: 'New' },
  { name: 'Maya Patel', role: 'Retail Associate', initials: 'MP', tone: 'mint', time: '38 min ago', status: 'New' },
  { name: 'Cameron Lee', role: 'Customer Service Rep', initials: 'CL', tone: 'blue', time: '1 hr ago', status: 'New' },
  { name: 'Avery Thompson', role: 'Print & Design Specialist', initials: 'AT', tone: 'peach', time: '2 hrs ago', status: 'New' },
]

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Applicants', icon: UsersRound, count: '4' },
  { label: 'Job posts', icon: BriefcaseBusiness },
  { label: 'Interviews', icon: Video },
]

export default function DashboardDesignPreview() {
  return (
    <main className="preview-shell">
      <aside className="preview-sidebar">
        <div className="preview-brand">
          <div className="preview-brand-mark">H</div>
          <span>hire<span>hub</span></span>
        </div>
        <div className="preview-workspace">
          <div className="preview-company-logo">U</div>
          <div><strong>The UPS Store</strong><small>Business workspace</small></div>
          <ChevronDown aria-hidden="true" />
        </div>
        <nav className="preview-nav" aria-label="Preview dashboard navigation">
          <p className="preview-nav-label">Workspace</p>
          {navItems.map(({ label, icon: Icon, active, count }) => (
            <a key={label} className={`preview-nav-link${active ? ' is-active' : ''}`} href="#">
              <Icon aria-hidden="true" /><span>{label}</span>{count && <b>{count}</b>}
            </a>
          ))}
          <p className="preview-nav-label preview-nav-label-spaced">Manage</p>
          <a className="preview-nav-link" href="#"><FileText aria-hidden="true" /><span>Talent pool</span></a>
          <a className="preview-nav-link" href="#"><Settings aria-hidden="true" /><span>Settings</span></a>
        </nav>
        <div className="preview-sidebar-bottom">
          <div className="preview-tip"><Sparkles aria-hidden="true" /><strong>Hiring tip</strong><p>Keep candidates moving with timely updates.</p><a href="#">Explore resources <ArrowUpRight aria-hidden="true" /></a></div>
          <div className="preview-profile"><div className="preview-avatar avatar-blue">JD</div><div><strong>Jordan Davis</strong><small>Owner account</small></div><MoreHorizontal aria-hidden="true" /></div>
        </div>
      </aside>

      <section className="preview-main">
        <header className="preview-topbar">
          <div className="preview-breadcrumb"><span>Workspace</span><b>/</b><strong>Overview</strong></div>
          <div className="preview-top-actions"><button className="preview-icon-button" aria-label="Search"><Search aria-hidden="true" /></button><button className="preview-icon-button notification-button" aria-label="Notifications"><Bell aria-hidden="true" /><i /></button><div className="preview-top-user"><div className="preview-avatar avatar-blue">JD</div><ChevronDown aria-hidden="true" /></div></div>
        </header>
        <div className="preview-content">
          <div className="preview-welcome-row"><div><p className="preview-eyebrow">Tuesday, September 29, 2026</p><h1>Good morning, Jordan <span>—</span></h1><p className="preview-lede">Here&apos;s what&apos;s happening with your hiring today.</p></div><button className="preview-primary-button"><Plus aria-hidden="true" /> Post a new job</button></div>

          <div className="preview-metric-grid">
            <article className="preview-metric-card metric-indigo"><div className="metric-head"><span>Total applicants</span><span className="metric-icon"><UsersRound aria-hidden="true" /></span></div><strong>4</strong><p><span className="trend-up">+100%</span> <span>vs. last month</span></p><div className="metric-sparkline"><i /><i /><i /><i /><i /><i /><i /></div></article>
            <article className="preview-metric-card metric-mint"><div className="metric-head"><span>New applicants</span><span className="metric-icon"><Sparkles aria-hidden="true" /></span></div><strong>4</strong><p><span className="trend-up">+4</span> <span>this week</span></p><div className="metric-bars"><i /><i /><i /><i /><i /><i /><i /></div></article>
            <article className="preview-metric-card metric-lavender"><div className="metric-head"><span>In review</span><span className="metric-icon"><Clock3 aria-hidden="true" /></span></div><strong>0</strong><p><span>Ready for your review</span></p><div className="metric-progress"><i /></div></article>
            <article className="preview-metric-card metric-peach"><div className="metric-head"><span>Hired</span><span className="metric-icon"><BriefcaseBusiness aria-hidden="true" /></span></div><strong>0</strong><p><span>Build your next team</span></p><div className="metric-progress"><i /></div></article>
          </div>

          <div className="preview-section-grid">
            <article className="preview-panel analytics-panel"><div className="panel-heading"><div><h2>Applicant activity</h2><p>New applications over the last 30 days</p></div><button className="preview-select">Last 30 days <ChevronDown aria-hidden="true" /></button></div><div className="chart-area"><div className="chart-y-labels"><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span><span>0</span></div><div className="chart"><div className="chart-grid"><i /><i /><i /><i /><i /><i /></div><svg viewBox="0 0 700 180" preserveAspectRatio="none" aria-label="Applicant activity trend"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#a99cf7" stopOpacity=".35" /><stop offset="100%" stopColor="#a99cf7" stopOpacity="0" /></linearGradient></defs><path d="M0 165 C45 165 57 151 91 158 S135 125 175 137 S220 114 255 126 S300 143 335 122 S375 122 412 130 S460 108 500 116 S550 67 585 83 S638 52 700 60 L700 180 L0 180 Z" fill="url(#chartFill)" /><path d="M0 165 C45 165 57 151 91 158 S135 125 175 137 S220 114 255 126 S300 143 335 122 S375 122 412 130 S460 108 500 116 S550 67 585 83 S638 52 700 60" fill="none" stroke="#8878eb" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-x-labels"><span>Sep 1</span><span>Sep 7</span><span>Sep 14</span><span>Sep 21</span><span>Sep 29</span></div></div></div></article>
            <article className="preview-panel source-panel"><div className="panel-heading"><div><h2>Application sources</h2><p>Where your candidates found you</p></div><button className="preview-more" aria-label="More options"><MoreHorizontal aria-hidden="true" /></button></div><div className="donut-wrap"><div className="donut"><div><strong>4</strong><span>Total</span></div></div><div className="source-legend"><span><i className="legend-blue" />Website <b>2</b></span><span><i className="legend-purple" />Indeed <b>1</b></span><span><i className="legend-mint" />Referral <b>1</b></span></div></div></article>
          </div>

          <article className="preview-panel applicants-panel"><div className="panel-heading"><div><h2>Recent applicants</h2><p>Keep your candidate pipeline moving</p></div><Link href="#" className="preview-view-all">View all applicants <ArrowUpRight aria-hidden="true" /></Link></div><div className="applicant-table"><div className="applicant-table-head"><span>Candidate</span><span>Applied for</span><span>Applied</span><span>Status</span><span /></div>{applicants.map((applicant) => <div className="applicant-row" key={applicant.name}><div className="candidate-cell"><div className={`preview-avatar avatar-${applicant.tone}`}>{applicant.initials}</div><strong>{applicant.name}</strong></div><span>{applicant.role}</span><span>{applicant.time}</span><span><em className="status-new">{applicant.status}</em></span><button className="preview-more" aria-label={`More options for ${applicant.name}`}><MoreHorizontal aria-hidden="true" /></button></div>)}</div></article>
          <div className="preview-footer-note"><CircleHelp aria-hidden="true" /> This is an isolated design preview using sample data. <Link href="/admin">Return to your dashboard</Link></div>
        </div>
      </section>
    </main>
  )
}
