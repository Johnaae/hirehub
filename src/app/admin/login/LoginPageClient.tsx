'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutTemplate, Users, CalendarCheck, Moon, Sun, Check,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import PasswordInput from '@/components/PasswordInput';
import HireHubLogo from '@/components/auth/HireHubLogo';
import '@/app/business-login.css';

const REMEMBER_KEY = 'hirehub_remember_email';
const THEME_KEY = 'hirehub_login_theme';

interface SessionInfo {
  loggedIn: boolean;
  email?: string;
  role?: string;
  impersonating?: boolean;
}

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: 'Company branded hiring portals',
    description: 'Launch a careers page that matches your brand in minutes.',
  },
  {
    icon: Users,
    title: 'Applicant tracking',
    description: 'Review, filter, and manage candidates in one place.',
  },
  {
    icon: CalendarCheck,
    title: 'Interview scheduling',
    description: 'Coordinate interviews and keep your pipeline moving.',
  },
] as const;

const TRUSTED_PLACEHOLDERS = ['Retail', 'Salon', 'Restaurant', 'Services'];

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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const from = searchParams.get('from') || '/admin';

  useEffect(() => {
    const stored = localStorage.getItem(REMEMBER_KEY);
    if (stored) {
      setEmail(stored);
      setRememberMe(true);
    }
    const storedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((d) => setSession(d))
      .finally(() => setCheckingSession(false));
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  };

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
      await new Promise((r) => setTimeout(r, 380));
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
      <div className="business-login-loading" data-theme={theme}>
        <div className="business-login-loading-card">
          <div className="business-login-spinner" aria-hidden="true" />
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`business-login${exiting ? ' business-login--exiting' : ''}`}
      data-theme={theme}
    >
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          className: 'business-login-toast',
          style: { borderRadius: '12px' },
        }}
      />

      {/* Left — Marketing */}
      <aside className="business-login-marketing" aria-hidden="false">
        <div className="business-login-blob business-login-blob--1" />
        <div className="business-login-blob business-login-blob--2" />
        <div className="business-login-blob business-login-blob--3" />

        <div className="business-login-marketing-inner">
          <HireHubLogo size="lg" variant="light" href="/" />

          <h1 className="business-login-headline">Hiring made simple.</h1>
          <p className="business-login-subtitle">
            Create beautiful career pages, manage applicants, schedule interviews and hire faster.
          </p>

          <div className="business-login-features">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="business-login-feature">
                <div className="business-login-feature-icon">
                  <Icon size={20} strokeWidth={2} />
                </div>
                <div className="business-login-feature-text">
                  <strong>
                    <Check size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
                    {title}
                  </strong>
                  <span>{description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="business-login-trusted">
          <p className="business-login-trusted-label">Trusted by local businesses</p>
          <div className="business-login-trusted-logos">
            {TRUSTED_PLACEHOLDERS.map((name) => (
              <span key={name} className="business-login-trusted-logo">{name}</span>
            ))}
          </div>
        </div>
      </aside>

      {/* Right — Login card */}
      <main className="business-login-main">
        <button
          type="button"
          className="business-login-theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="business-login-card">
          <div className="business-login-card-header">
            <HireHubLogo size="lg" variant="dark" />
            <h2 className="business-login-card-title">Business Login</h2>
            <p className="business-login-card-subtitle">Company Owner &amp; Manager</p>
          </div>

          {session?.loggedIn ? (
            <div className="business-login-session">
              <p>
                You are already logged in as{' '}
                <strong>{session.email}</strong>
                {session.impersonating && ' (impersonating)'}.
              </p>
              <div className="business-login-session-actions">
                <Link href="/admin" className="business-login-submit" style={{ textDecoration: 'none' }}>
                  Go to Dashboard
                </Link>
                <button
                  type="button"
                  className="business-login-btn-secondary"
                  onClick={handleLogoutAndContinue}
                >
                  Log in as different company
                </button>
              </div>
            </div>
          ) : (
            <form className="business-login-form" onSubmit={handleSubmit} noValidate>
              <div className="business-login-field">
                <label htmlFor="email" className="business-login-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className={`business-login-input${emailError ? ' business-login-input--error' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onBlur={handleEmailBlur}
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  disabled={submitting}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
                {emailError && (
                  <span id="email-error" className="business-login-field-error" role="alert">
                    {emailError}
                  </span>
                )}
              </div>

              <div className="business-login-field">
                <label htmlFor="password" className="business-login-label">Password</label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={setPassword}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  disabled={submitting}
                />
              </div>

              <div className="business-login-row">
                <label className="business-login-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={submitting}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="business-login-forgot"
                  onClick={handleForgotPassword}
                  tabIndex={0}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="business-login-submit"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <span className="business-login-spinner" aria-hidden="true" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          <div className="business-login-divider" aria-hidden="true" />

          <p className="business-login-footer-text">Need a company account?</p>
          <div className="business-login-footer-links">
            <Link href="/" className="business-login-footer-link">
              Request Demo
            </Link>
            <Link href="/super-admin/login" className="business-login-footer-link business-login-footer-link--muted">
              Super Admin Login
            </Link>
            <Link href="/" className="business-login-footer-link business-login-footer-link--muted">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
