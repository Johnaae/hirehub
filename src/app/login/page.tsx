import { Suspense } from 'react';
import LoginPageClient from '../admin/login/LoginPageClient';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="page login-page"><div className="login-container"><div className="login-card card">Loading...</div></div></div>}>
      <LoginPageClient />
    </Suspense>
  );
}
