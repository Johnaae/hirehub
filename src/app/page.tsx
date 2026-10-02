import Link from 'next/link';
import { ArrowRight, BarChart3, Building2, Check, LogIn, Sparkles, Users } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

const capabilities = [
  { icon: Building2, eyebrow: 'Brand', title: 'Career pages that feel like you', copy: 'Give every location a polished, on-brand destination for the people you want to hire.' },
  { icon: Users, eyebrow: 'Pipeline', title: 'Every applicant, in context', copy: 'Move from first impression to offer with a clear view of candidates, conversations, and next steps.' },
  { icon: BarChart3, eyebrow: 'Clarity', title: 'Decisions backed by signal', copy: 'See which roles are moving, where candidates come from, and what your team should do next.' },
];

export default function HomePage() {
  return (
    <div className="page hirehub-landing">
      <header className="hirehub-header">
        <div className="container header-inner">
          <Link href="/" className="hirehub-logo" aria-label="HireHub home">
            <span className="hirehub-logo-mark">H</span>
            <span className="hirehub-logo-name">HireHub</span>
          </Link>
          <nav className="hirehub-nav" aria-label="Main navigation">
            <a href="#platform">Platform</a>
            <a href="#workflow">How it works</a>
            <Link href="/login" className="btn btn-primary hirehub-login-btn"><LogIn size={16} /> Business login</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hirehub-hero">
          <div className="container hirehub-hero-grid">
            <div className="hirehub-hero-copy">
              <div className="hirehub-kicker"><span className="hirehub-kicker-dot" /> The hiring operating system for local teams</div>
              <h1>Build a team your business can grow with.</h1>
              <p className="hirehub-hero-text">HireHub brings your careers brand, applicant pipeline, and interview process into one calm, focused workspace.</p>
              <div className="hirehub-hero-actions">
                <Link href="/login" className="btn btn-primary btn-lg">Open your workspace <ArrowRight size={17} /></Link>
                <a href="#platform" className="hirehub-text-link">Explore the platform <ArrowRight size={15} /></a>
              </div>
              <div className="hirehub-proof"><span><Check size={15} /> Branded career pages</span><span><Check size={15} /> Simple applicant tracking</span></div>
            </div>
            <div className="hirehub-product-preview" aria-label="HireHub applicant pipeline preview">
              <div className="preview-glow" />
              <div className="preview-window">
                <div className="preview-topbar"><span className="preview-brand"><span>H</span> HireHub</span><span className="preview-user">JD</span></div>
                <div className="preview-body">
                  <div className="preview-heading"><div><span className="preview-label">OVERVIEW</span><strong>Good morning, Jordan</strong></div><span className="preview-date">This week · Jan 14–20</span></div>
                  <div className="preview-stats"><div><span>Open roles</span><strong>12</strong><small>+3 this month</small></div><div><span>New applicants</span><strong>48</strong><small>+18.4%</small></div><div><span>Interviews</span><strong>09</strong><small>Next: 2 today</small></div></div>
                  <div className="preview-pipeline"><div className="preview-label">CANDIDATE PIPELINE <span>View all</span></div><div className="pipeline-row"><span className="pipeline-avatar avatar-one">AM</span><div><strong>Alex Morgan</strong><small>Operations Manager</small></div><span className="pipeline-status">Interview</span></div><div className="pipeline-row"><span className="pipeline-avatar avatar-two">TK</span><div><strong>Taylor Kim</strong><small>Store Lead · Downtown</small></div><span className="pipeline-status is-new">New</span></div><div className="pipeline-row"><span className="pipeline-avatar avatar-three">JR</span><div><strong>Jamie Rivera</strong><small>Customer Experience</small></div><span className="pipeline-status">Review</span></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="hirehub-metric-strip"><div className="container"><span>Designed for teams who hire with intention</span><div><strong>01</strong> One workspace <strong>02</strong> Less admin <strong>03</strong> Better hires</div></div></section>

        <section className="section hirehub-capabilities" id="platform">
          <div className="container"><div className="section-intro"><span className="section-eyebrow">One connected platform</span><h2>Everything your hiring team needs.<br /><em>Nothing it doesn&apos;t.</em></h2><p>From your first job post to the signed offer, HireHub keeps the work moving and the experience considered.</p></div><div className="hirehub-capability-grid">{capabilities.map(({ icon: Icon, eyebrow, title, copy }) => <article className="hirehub-capability" key={title}><div className="capability-icon"><Icon size={21} /></div><span className="section-eyebrow">{eyebrow}</span><h3>{title}</h3><p>{copy}</p><ArrowRight size={18} className="capability-arrow" /></article>)}</div></div>
        </section>

        <section className="hirehub-workflow" id="workflow"><div className="container hirehub-workflow-inner"><div><span className="section-eyebrow">A better hiring rhythm</span><h2>From open role<br />to great fit.</h2></div><div className="workflow-steps"><div><span>01</span><div><strong>Shape the story</strong><p>Make each opportunity clear, compelling, and unmistakably yours.</p></div></div><div><span>02</span><div><strong>See the full picture</strong><p>Give every candidate the attention and context they deserve.</p></div></div><div><span>03</span><div><strong>Make the next move</strong><p>Align your team and move forward with confidence.</p></div></div></div></div></section>

        <section className="hirehub-cta"><div className="container"><div className="hirehub-cta-card"><div><Sparkles size={20} /><h2>Make hiring your advantage.</h2><p>Spend less time coordinating. More time building the team that moves your business forward.</p></div><Link href="/login" className="btn btn-light btn-lg">Get started <ArrowRight size={17} /></Link></div></div></section>
      </main>
      <footer className="footer hirehub-footer"><div className="container"><span className="hirehub-footer-logo"><span className="hirehub-logo-mark">H</span> HireHub</span><p>© {CURRENT_YEAR} HireHub. Hiring, made human.</p><Link href="/login">Business login <ArrowRight size={14} /></Link></div></footer>
    </div>
  );
}
