'use client';

import Link from 'next/link';
import { Briefcase, Building2, LogIn, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="page hirehub-landing">
      <header className="hirehub-header">
        <div className="container header-inner">
          <Link href="/" className="hirehub-logo">
            <div className="hirehub-logo-mark">H</div>
            <span className="hirehub-logo-name">HireHub</span>
          </Link>
          <Link href="/login" className="btn btn-primary hirehub-login-btn">
            <LogIn size={16} /> Login
          </Link>
        </div>
      </header>

      <section className="hirehub-hero">
        <div className="container">
          <span className="hirehub-badge">Multi-tenant hiring platform</span>
          <h1>Hiring portals for local businesses</h1>
          <p className="hirehub-hero-text">
            HireHub gives every business its own branded careers page, applicant tracking,
            and interview management — all from one platform.
          </p>
          <div className="hirehub-hero-actions">
            <Link href="/login" className="btn btn-primary">Business Login</Link>
          </div>
        </div>
      </section>

      <section className="section hirehub-features">
        <div className="container">
          <div className="hirehub-features-grid">
            <div className="card hirehub-feature-card">
              <Building2 size={28} />
              <h3>Branded career pages</h3>
              <p>Each company gets a unique URL with its logo, colors, and open positions.</p>
            </div>
            <div className="card hirehub-feature-card">
              <Users size={28} />
              <h3>Applicant tracking</h3>
              <p>Review applications, schedule interviews, and hire — all in one dashboard.</p>
            </div>
            <div className="card hirehub-feature-card">
              <Briefcase size={28} />
              <h3>Job management</h3>
              <p>Publish roles, use templates, and track applicants per position.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer hirehub-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} HireHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
