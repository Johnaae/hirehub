'use client';

import { useEffect, useState } from 'react';
import {
  User, Mail, Lock, Shield, Calendar, Clock, LogOut, KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import PasswordInput from '@/components/PasswordInput';

interface AdminAccount {
  id: number;
  name: string | null;
  email: string;
  notificationEmail: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  updatedAt: string;
}

function formatDate(iso: string | null) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AccountSecuritySection() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AdminAccount | null>(null);

  const [profile, setProfile] = useState({ name: '', notificationEmail: '' });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});
  const [savingEmail, setSavingEmail] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  const loadAccount = () =>
    fetch('/api/admin/account')
      .then((r) => r.json())
      .then((d) => {
        if (d.admin) {
          setAccount(d.admin);
          setProfile({
            name: d.admin.name || '',
            notificationEmail: d.admin.notificationEmail || '',
          });
          setNewEmail(d.admin.email);
        }
      });

  useEffect(() => {
    loadAccount().finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});
    setSavingProfile(true);

    const res = await fetch('/api/admin/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: profile.name,
        notificationEmail: profile.notificationEmail || null,
      }),
    });

    const data = await res.json();
    setSavingProfile(false);

    if (res.ok) {
      setAccount(data.admin);
      toast.success('Account details updated');
    } else {
      if (data.fieldErrors) setProfileErrors(data.fieldErrors);
      toast.error(data.error || 'Failed to update account');
    }
  };

  const handleEmailSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailErrors({});
    setSavingEmail(true);

    const res = await fetch('/api/admin/account/email', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail }),
    });

    const data = await res.json();
    setSavingEmail(false);

    if (res.ok) {
      toast.success(data.message || 'Login email updated');
      router.push('/login');
    } else {
      if (data.fieldErrors) setEmailErrors(data.fieldErrors);
      toast.error(data.error || 'Failed to update email');
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    setSavingPassword(true);

    const res = await fetch('/api/admin/account/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwords),
    });

    const data = await res.json();
    setSavingPassword(false);

    if (res.ok) {
      toast.success(data.message || 'Password updated');
      router.push('/login');
    } else {
      if (data.fieldErrors) setPasswordErrors(data.fieldErrors);
      toast.error(data.error || 'Failed to update password');
    }
  };

  if (loading) return <div className="saas-loading">Loading account...</div>;

  return (
    <div className="settings-sections">
      <div className="saas-card settings-card">
        <div className="settings-card-header">
          <User size={20} />
          <div>
            <h3>Owner Account</h3>
            <p>Manage your name and notification preferences</p>
          </div>
        </div>
        <form onSubmit={handleProfileSave}>
          <div className="saas-form-row">
            <div className="saas-form-group">
              <label>Owner Name</label>
              <input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Store Owner"
              />
              {profileErrors.name && <span className="field-error">{profileErrors.name}</span>}
            </div>
            <div className="saas-form-group">
              <label>Notification Email</label>
              <input
                type="email"
                value={profile.notificationEmail}
                onChange={(e) => setProfile({ ...profile, notificationEmail: e.target.value })}
                placeholder="alerts@yourstore.com"
              />
              <span className="field-hint">Receives new applicant, interview, and owner alerts</span>
              {profileErrors.notificationEmail && (
                <span className="field-error">{profileErrors.notificationEmail}</span>
              )}
            </div>
          </div>
          <button type="submit" className="saas-btn saas-btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Account Details'}
          </button>
        </form>
      </div>

      <div className="saas-card settings-card">
        <div className="settings-card-header">
          <Mail size={20} />
          <div>
            <h3>Login Email</h3>
            <p>Change the email you use to sign in</p>
          </div>
        </div>
        <form onSubmit={handleEmailSave}>
          <div className="saas-form-group">
            <label>Login Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <span className="field-hint">You will be signed out and must log in again after changing your email</span>
            {emailErrors.email && <span className="field-error">{emailErrors.email}</span>}
          </div>
          <button
            type="submit"
            className="saas-btn saas-btn-outline"
            disabled={savingEmail || newEmail === account?.email}
          >
            {savingEmail ? 'Updating...' : 'Update Login Email'}
          </button>
        </form>
      </div>

      <div className="saas-card settings-card">
        <div className="settings-card-header">
          <Lock size={20} />
          <div>
            <h3>Change Password</h3>
            <p>Keep your account secure with a strong password</p>
          </div>
        </div>
        <form onSubmit={handlePasswordSave}>
          <div className="saas-form-group">
            <label>Current Password</label>
            <PasswordInput
              id="current-password"
              value={passwords.currentPassword}
              onChange={(v) => setPasswords({ ...passwords, currentPassword: v })}
              autoComplete="current-password"
            />
            {passwordErrors.currentPassword && (
              <span className="field-error">{passwordErrors.currentPassword}</span>
            )}
          </div>
          <div className="saas-form-row">
            <div className="saas-form-group">
              <label>New Password</label>
              <PasswordInput
                id="new-password"
                value={passwords.newPassword}
                onChange={(v) => setPasswords({ ...passwords, newPassword: v })}
                autoComplete="new-password"
                minLength={8}
              />
              <span className="field-hint">Minimum 8 characters</span>
              {passwordErrors.newPassword && (
                <span className="field-error">{passwordErrors.newPassword}</span>
              )}
            </div>
            <div className="saas-form-group">
              <label>Confirm New Password</label>
              <PasswordInput
                id="confirm-password"
                value={passwords.confirmPassword}
                onChange={(v) => setPasswords({ ...passwords, confirmPassword: v })}
                autoComplete="new-password"
              />
              {passwordErrors.confirmPassword && (
                <span className="field-error">{passwordErrors.confirmPassword}</span>
              )}
            </div>
          </div>
          <button type="submit" className="saas-btn saas-btn-outline" disabled={savingPassword}>
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="saas-card settings-card">
        <div className="settings-card-header">
          <Shield size={20} />
          <div>
            <h3>Security</h3>
            <p>Account activity and advanced security options</p>
          </div>
        </div>
        <div className="security-info-grid">
          <div className="security-info-item">
            <Calendar size={16} />
            <div>
              <span className="security-label">Account Created</span>
              <span className="security-value">{formatDate(account?.createdAt ?? null)}</span>
            </div>
          </div>
          <div className="security-info-item">
            <Clock size={16} />
            <div>
              <span className="security-label">Last Login</span>
              <span className="security-value">{formatDate(account?.lastLoginAt ?? null)}</span>
            </div>
          </div>
        </div>
        <div className="security-placeholders">
          <button type="button" className="saas-btn saas-btn-ghost" disabled title="Coming soon">
            <LogOut size={16} /> Logout All Devices
            <span className="coming-soon-badge">Coming soon</span>
          </button>
          <button type="button" className="saas-btn saas-btn-ghost" disabled title="Coming soon">
            <KeyRound size={16} /> Two-Factor Authentication
            <span className="coming-soon-badge">Coming soon</span>
          </button>
        </div>
      </div>
    </div>
  );
}
