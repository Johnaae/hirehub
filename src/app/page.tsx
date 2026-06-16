'use client';

import PublicHeader from '@/components/PublicHeader';
import ApplicationForm from '@/components/ApplicationForm';
import { useConfig } from '@/components/ConfigProvider';

export default function HomePage() {
  const { config } = useConfig();

  const scrollToForm = () => {
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="page">
      <PublicHeader />

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge">Now Hiring</span>
            <h1>Join Our Team</h1>
            <p className="hero-text">
              We are now accepting applications for friendly, reliable team members.
            </p>
            <button type="button" className="btn btn-accent btn-lg" onClick={scrollToForm}>
              Apply Now
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="job-card card">
            <h2>Open Position</h2>
            <h3 className="job-title">Customer Service / Print &amp; Shipping Associate</h3>
            <div className="job-details">
              <div className="job-block">
                <h4>Responsibilities</h4>
                <ul>
                  <li>Greet and assist customers</li>
                  <li>Process shipping and packing orders</li>
                  <li>Handle printing and document services</li>
                  <li>Operate POS system</li>
                  <li>Keep store clean and organized</li>
                </ul>
              </div>
              <div className="job-block">
                <h4>Requirements</h4>
                <ul>
                  <li>Friendly attitude</li>
                  <li>Reliable and punctual</li>
                  <li>Basic computer skills</li>
                  <li>Customer service experience preferred</li>
                  <li>Must be authorized to work in the United States</li>
                </ul>
              </div>
            </div>
            <button type="button" className="btn btn-primary" onClick={scrollToForm}>
              Apply Now
            </button>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container container-narrow">
          <ApplicationForm />
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {config.storeName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
