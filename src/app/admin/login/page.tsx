import { Suspense } from 'react';
import LoginPageClient from './LoginPageClient';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="page-center"><div className="spinner spinner-lg" aria-label="Loading" /></div>}>
      <LoginPageClient />
    </Suspense>
  );
}
