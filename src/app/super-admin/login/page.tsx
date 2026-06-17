import { Suspense } from 'react';
import SuperAdminLoginPageClient from './SuperAdminLoginPageClient';

export default function SuperAdminLoginPage() {
  return (
    <Suspense fallback={<div className="page login-page"><div className="login-container"><div className="login-card card">Loading...</div></div></div>}>
      <SuperAdminLoginPageClient />
    </Suspense>
  );
}
