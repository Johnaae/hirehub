import { Suspense } from 'react';
import LoginPageClient from './LoginPageClient';

function LoginFallback() {
  return (
    <div className="business-login-loading">
      <div className="business-login-loading-card">
        <div className="business-login-spinner" style={{ borderColor: 'rgba(37,99,235,0.25)', borderTopColor: '#2563eb' }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageClient />
    </Suspense>
  );
}
