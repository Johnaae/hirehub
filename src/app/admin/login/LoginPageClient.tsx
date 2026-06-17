'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import LoginCard from '@/components/auth/LoginCard';
import MarketingPanel from '@/components/auth/MarketingPanel';

const REMEMBER_KEY = 'hirehub_remember_email';

interface SessionInfo {
  loggedIn: boolean;
  email?: string;
  role?: string;
  impersonating?: boolean;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const from = searchParams.get('from') || '/admin';

  useEffect(() => {
    const stored = localStorage.getItem(REMEMBER_KEY);
    if (stored) {
      setEmail(stored);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((d) => setSession(d))
      .finally(() => setCheckingSession(false));
  }, []);

  const handleLogoutAndContinue = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setSession({ loggedIn: false });
    toast.success('Signed out. You can log in as a different company.');
  };

  const handleEmailBlur = () => {
    if (!email.trim()) {
      setEmailError('');
      return;
    }
    setEmailError(isValidEmail(email) ? '' : 'Please enter a valid email address');
  };

  const handleForgotPassword = () => {
    toast.info('Contact your company administrator to reset your password.', {
      description: 'For security, password resets are handled by your account owner.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setEmailError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.suspended) {
          toast.error('Your company account is inactive', {
            description: 'Please contact support to reactivate your account.',
          });
          setTimeout(() => router.push('/suspended'), 1200);
          return;
        }
        if (data.superAdmin) {
          toast.error('Super Admin account detected', {
            description: 'Please sign in at /super-admin/login',
          });
          return;
        }
        const message = data.error || 'Login failed';
        if (message.toLowerCase().includes('invalid')) {
          toast.error('Incorrect email or password', {
            description: 'Double-check your credentials and try again.',
          });
        } else {
          toast.error(message);
        }
        return;
      }

      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      toast.success('Welcome back!');
      setExiting(true);
      await new Promise((r) => setTimeout(r, 300));
      router.push(data.redirectTo || from);
      router.refresh();
    } catch {
      toast.error('Something went wrong', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="login-page login-page--loading">
        <div className="login-left">
          <p className="login-loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors closeButton />

      <div className={`login-page${exiting ? ' login-page--exiting' : ''}`}>
        <div className="login-left">
          <LoginCard
            session={session}
            email={email}
            password={password}
            rememberMe={rememberMe}
            emailError={emailError}
            submitting={submitting}
            onEmailChange={(v) => {
              setEmail(v);
              if (emailError) setEmailError('');
            }}
            onPasswordChange={setPassword}
            onRememberMeChange={setRememberMe}
            onEmailBlur={handleEmailBlur}
            onForgotPassword={handleForgotPassword}
            onSubmit={handleSubmit}
            onLogoutAndContinue={handleLogoutAndContinue}
          />
        </div>

        <div className="login-right">
          <MarketingPanel />
        </div>
      </div>
    </>
  );
}
