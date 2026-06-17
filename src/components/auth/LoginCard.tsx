import Link from 'next/link';
import PasswordInput from '@/components/PasswordInput';

interface SessionInfo {
  loggedIn: boolean;
  email?: string;
  impersonating?: boolean;
}

interface LoginCardProps {
  session: SessionInfo | null;
  email: string;
  password: string;
  rememberMe: boolean;
  emailError: string;
  submitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (checked: boolean) => void;
  onEmailBlur: () => void;
  onForgotPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onLogoutAndContinue: () => void;
}

export default function LoginCard({
  session,
  email,
  password,
  rememberMe,
  emailError,
  submitting,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onEmailBlur,
  onForgotPassword,
  onSubmit,
  onLogoutAndContinue,
}: LoginCardProps) {
  return (
    <div className="login-card">
      <div className="login-card-header">
        <div className="login-card-logo">
          <span className="login-card-logo-mark" aria-hidden="true">H</span>
          <span className="login-card-logo-name">HireHub</span>
        </div>
        <h2 className="login-card-title">Business Login</h2>
        <p className="login-card-subtitle">Company Owner &amp; Manager</p>
      </div>

      {session?.loggedIn ? (
        <div className="login-session">
          <p>
            You are already logged in as <strong>{session.email}</strong>
            {session.impersonating && ' (impersonating)'}.
          </p>
          <div className="login-session-actions">
            <Link href="/admin" className="login-submit" style={{ textDecoration: 'none' }}>
              Go to Dashboard
            </Link>
            <button type="button" className="login-btn-secondary" onClick={onLogoutAndContinue}>
              Log in as different company
            </button>
          </div>
        </div>
      ) : (
        <form className="login-form" onSubmit={onSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="email" className="login-label">Email</label>
            <input
              id="email"
              type="email"
              className={`login-input${emailError ? ' login-input--error' : ''}`}
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              onBlur={onEmailBlur}
              required
              autoComplete="email"
              placeholder="you@company.com"
              disabled={submitting}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && (
              <span id="email-error" className="login-field-error" role="alert">
                {emailError}
              </span>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">Password</label>
            <PasswordInput
              id="password"
              value={password}
              onChange={onPasswordChange}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={submitting}
            />
          </div>

          <div className="login-row">
            <label className="login-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => onRememberMeChange(e.target.checked)}
                disabled={submitting}
              />
              Remember me
            </label>
            <button type="button" className="login-forgot" onClick={onForgotPassword}>
              Forgot password?
            </button>
          </div>

          <button type="submit" className="login-submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      )}

      <div className="login-divider" aria-hidden="true" />

      <div className="login-footer-links">
        <Link href="/super-admin/login" className="login-footer-link">
          Super Admin Login
        </Link>
        <Link href="/" className="login-footer-link login-footer-link--muted">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
