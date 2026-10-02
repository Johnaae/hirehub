import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, MoreHorizontal, Users } from 'lucide-react';

export default function MarketingPanel() {
  return (
    <div className="marketing-panel">
      <div className="marketing-panel-topline">
        <Link href="/" className="marketing-panel-logo" aria-label="HireHub home">
          <span className="marketing-panel-logo-mark" aria-hidden="true">H</span>
          <span className="marketing-panel-logo-name">HireHub</span>
        </Link>
        <span className="marketing-panel-status"><span aria-hidden="true" /> Live workspace</span>
      </div>

      <div className="marketing-panel-copy">
        <p className="marketing-panel-kicker">A calmer way to hire</p>
        <h1 className="marketing-panel-headline">Your best team is closer than you think.</h1>
        <p className="marketing-panel-subtitle">
          Bring every candidate, conversation, and decision into one beautifully simple workspace.
        </p>
      </div>

      <div className="marketing-dashboard" aria-label="Preview of the HireHub recruiting dashboard">
        <div className="marketing-dashboard-bar">
          <div className="marketing-dashboard-dots"><span /><span /><span /></div>
          <span className="marketing-dashboard-title">Hiring overview</span>
          <MoreHorizontal aria-hidden="true" />
        </div>
        <div className="marketing-dashboard-body">
          <div className="marketing-dashboard-heading">
            <div><span className="marketing-dashboard-eyebrow">Tuesday, October 8</span><strong>Good morning, team</strong></div>
            <button type="button" aria-label="Open dashboard"><ArrowUpRight aria-hidden="true" /></button>
          </div>
          <div className="marketing-dashboard-stats">
            <div><span>Open roles</span><strong>12</strong><small>+3 this month</small></div>
            <div><span>New candidates</span><strong>48</strong><small>+18.2% this week</small></div>
          </div>
          <div className="marketing-dashboard-pipeline">
            <div className="marketing-pipeline-header"><span>Candidate pipeline</span><span>View report <ArrowUpRight aria-hidden="true" /></span></div>
            <div className="marketing-pipeline-row"><span className="marketing-avatar marketing-avatar--lavender">JM</span><div><strong>Jordan Mitchell</strong><small>Product Designer</small></div><span className="marketing-pipeline-badge"><CheckCircle2 aria-hidden="true" /> Interview</span></div>
            <div className="marketing-pipeline-row"><span className="marketing-avatar marketing-avatar--blue">AR</span><div><strong>Alex Rivera</strong><small>Senior Engineer</small></div><span className="marketing-pipeline-badge marketing-pipeline-badge--muted"><Users aria-hidden="true" /> Review</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
