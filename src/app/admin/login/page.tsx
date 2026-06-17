import { Suspense } from 'react';
import LoginPageClient from './LoginPageClient';
import '@/app/login-page.css';

function LoginFallback() {
  return (
    <div className="login-page login-page--loading">
      <div className="login-left">
        <p className="login-loading-text">Loading...</p>
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
