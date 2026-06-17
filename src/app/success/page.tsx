'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getCompanyCareerPath } from '@/lib/company-career';

function SuccessContent() {
  const searchParams = useSearchParams();
  const companySlug = searchParams.get('company');
  const [storeName, setStoreName] = useState('our team');

  useEffect(() => {
    if (companySlug) {
      fetch(`/api/careers/${companySlug}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.company?.storeName) setStoreName(d.company.storeName);
          if (d.company?.primaryColor) {
            document.documentElement.style.setProperty('--primary', d.company.primaryColor);
          }
          if (d.company?.accentColor) {
            document.documentElement.style.setProperty('--accent', d.company.accentColor);
          }
        });
    }
  }, [companySlug]);

  const backHref = companySlug ? getCompanyCareerPath({ id: 0, slug: companySlug }) : '/';

  return (
    <div className="page">
      <header className="hirehub-header minimal">
        <div className="container header-inner">
          <Link href="/" className="hirehub-logo">
            <div className="hirehub-logo-mark">H</div>
            <span className="hirehub-logo-name">HireHub</span>
          </Link>
        </div>
      </header>
      <div className="page-center">
        <div className="success-card card">
          <div className="success-icon">✓</div>
          <h1>Thank You!</h1>
          <p className="success-message">
            Thank you for applying. We have received your application.
          </p>
          <p className="success-subtext">
            Our team at {storeName} will review your application and contact you if your qualifications match our needs.
          </p>
          <Link href={backHref} className="btn btn-primary">
            {companySlug ? 'Back to Careers' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="page"><div className="page-center">Loading...</div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
