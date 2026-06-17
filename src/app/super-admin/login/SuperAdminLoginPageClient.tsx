'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PasswordInput from '@/components/PasswordInput';

interface SessionInfo {
  loggedIn: boolean;
  email?: string;
  impersonating?: boolean;
}

export default function SuperAdminLoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const from = searchParams.get('from') || '/super-admin';

  useEffect(() => {
    fetch('/api/super-admin/session')
      .then((r) => r.json())
      .then((d) => setSession(d))
      .finally(() => setCheckingSession(false));
  }, []);

  const handleLogoutAndContinue = async () => {
    await fetch('/api/super-admin/logout', { method: 'POST' });
    setSession({ loggedIn: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/super-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      router.push(data.redirectTo || from);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="page login-page">
        <div className="login-container">
          <div className="login-card card">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page login-page">
      <div className="login-container">
        <div className="login-card card">
          <div className="login-header">
            <div className="hirehub-logo-mark logo-icon-lg">H</div>
            <h1>Super Admin</h1>
            <p>Platform administration</p>
          </div>

          {session?.loggedIn ? (
            <div className="login-already-in">
              <p>
                You are already logged in as <strong>{session.email}</strong>.
              </p>
              <div className="login-already-actions">
                <Link href="/super-admin" className="btn btn-primary btn-block">Go to Super Admin</Link>
                <button type="button" className="btn btn-outline btn-block" onClick={handleLogoutAndContinue}>
                  Log in as different account
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="sa-email">Email</label>
                  <input id="sa-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="form-group">
                  <label htmlFor="sa-password">Password</label>
                  <PasswordInput
                    id="sa-password"
                    value={password}
                    onChange={setPassword}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </>
          )}

          <p className="login-super-admin-link">
            <Link href="/login">Company Owner Login</Link>
          </p>

          <Link href="/" className="login-back-link">&larr; Back to HireHub</Link>
        </div>
      </div>
    </div>
  );
}
