'use client';

import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import { useConfig } from '@/components/ConfigProvider';

export default function SuccessPage() {
  const { config } = useConfig();

  return (
    <div className="page">
      <PublicHeader />
      <div className="page-center">
        <div className="success-card card">
          <div className="success-icon">✓</div>
          <h1>Thank You!</h1>
          <p className="success-message">
            Thank you for applying. We have received your application.
          </p>
          <p className="success-subtext">
            Our team at {config.storeName} will review your application and contact you if your qualifications match our needs.
          </p>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
