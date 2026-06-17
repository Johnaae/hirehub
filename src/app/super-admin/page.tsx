'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Users, Briefcase, Plus, Eye, Ban, Trash2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import PasswordInput from '@/components/PasswordInput';

interface CompanyRow {
  id: number;
  name: string;
  slug: string;
  status: string;
  subscriptionStatus: string;
  createdAt: string;
  _count: { applicants: number; jobs: number; admins: number };
  stats: { applicants: number; jobs: number; interviews: number; admins: number };
}

export default function SuperAdminPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [creating, setCreating] = useState(false);
  const [wizard, setWizard] = useState({
    name: '', ownerName: '', ownerEmail: '', temporaryPassword: '',
    logoUrl: '', primaryColor: '#351C15', accentColor: '#FFB500', timezone: 'America/New_York',
  });

  const load = () =>
    fetch('/api/super-admin/companies')
      .then((r) => r.json())
      .then((d) => setCompanies(d.companies || []))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch('/api/super-admin/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wizard),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      toast.success(`Company "${data.company.name}" created`);
      setShowWizard(false);
      setWizard({ name: '', ownerName: '', ownerEmail: '', temporaryPassword: '', logoUrl: '', primaryColor: '#351C15', accentColor: '#FFB500', timezone: 'America/New_York' });
      load();
    } else {
      toast.error(data.error || 'Failed to create company');
    }
  };

  const toggleSuspend = async (id: number, suspend: boolean) => {
    const res = await fetch(`/api/super-admin/companies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: suspend ? 'suspend' : 'activate' }),
    });
    if (res.ok) { toast.success(suspend ? 'Company suspended' : 'Company activated'); load(); }
    else toast.error('Action failed');
  };

  const impersonate = async (companyId: number) => {
    const res = await fetch('/api/super-admin/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      router.push(data.redirectTo || '/admin');
      router.refresh();
    } else toast.error('Impersonation failed');
  };

  const resetPassword = async (id: number) => {
    const pwd = prompt('Enter new temporary password (min 8 chars):');
    if (!pwd || pwd.length < 8) return;
    const res = await fetch(`/api/super-admin/companies/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset-owner-password', newPassword: pwd }),
    });
    if (res.ok) toast.success('Owner password reset');
    else toast.error('Reset failed');
  };

  const handleLogout = async () => {
    await fetch('/api/super-admin/logout', { method: 'POST' });
    router.push('/super-admin/login');
  };

  return (
    <div className="saas-page super-admin-page">
      <div className="saas-page-header">
        <div>
          <h1>Super Admin</h1>
          <p className="saas-subtitle">Manage all companies on the platform</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="saas-btn saas-btn-primary" onClick={() => setShowWizard(true)}>
            <Plus size={16} /> Create Company
          </button>
          <button type="button" className="saas-btn saas-btn-ghost" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="ats-stats-row">
        <div className="ats-stat-card active">
          <span className="ats-stat-value">{companies.length}</span>
          <span className="ats-stat-label">Companies</span>
        </div>
        <div className="ats-stat-card">
          <span className="ats-stat-value">{companies.filter((c) => c.status === 'active').length}</span>
          <span className="ats-stat-label">Active</span>
        </div>
        <div className="ats-stat-card">
          <span className="ats-stat-value">{companies.reduce((s, c) => s + c.stats.applicants, 0)}</span>
          <span className="ats-stat-label">Total Applicants</span>
        </div>
      </div>

      {showWizard && (
        <div className="saas-modal-overlay" onClick={() => setShowWizard(false)}>
          <div className="saas-modal super-admin-wizard" onClick={(e) => e.stopPropagation()}>
            <h3>Create Company</h3>
            <form onSubmit={handleCreate}>
              <div className="saas-form-row">
                <div className="saas-form-group"><label>Company Name *</label><input required value={wizard.name} onChange={(e) => setWizard({ ...wizard, name: e.target.value })} /></div>
                <div className="saas-form-group"><label>Timezone</label><input value={wizard.timezone} onChange={(e) => setWizard({ ...wizard, timezone: e.target.value })} /></div>
              </div>
              <div className="saas-form-row">
                <div className="saas-form-group"><label>Owner Name *</label><input required value={wizard.ownerName} onChange={(e) => setWizard({ ...wizard, ownerName: e.target.value })} /></div>
                <div className="saas-form-group"><label>Owner Email *</label><input type="email" required value={wizard.ownerEmail} onChange={(e) => setWizard({ ...wizard, ownerEmail: e.target.value })} /></div>
              </div>
              <div className="saas-form-group">
                <label>Temporary Password *</label>
                <PasswordInput
                  id="wizard-temp-password"
                  value={wizard.temporaryPassword}
                  onChange={(v) => setWizard({ ...wizard, temporaryPassword: v })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className="saas-form-row">
                <div className="saas-form-group"><label>Primary Color</label><input type="color" value={wizard.primaryColor} onChange={(e) => setWizard({ ...wizard, primaryColor: e.target.value })} /></div>
                <div className="saas-form-group"><label>Accent Color</label><input type="color" value={wizard.accentColor} onChange={(e) => setWizard({ ...wizard, accentColor: e.target.value })} /></div>
              </div>
              <div className="saas-form-group"><label>Logo URL</label><input value={wizard.logoUrl} onChange={(e) => setWizard({ ...wizard, logoUrl: e.target.value })} placeholder="https://..." /></div>
              <div className="saas-confirm-actions">
                <button type="submit" className="saas-btn saas-btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create Company'}</button>
                <button type="button" className="saas-btn saas-btn-ghost" onClick={() => setShowWizard(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="saas-loading">Loading companies...</div>
      ) : (
        <div className="super-admin-table-wrap saas-card">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Status</th>
                <th>Subscription</th>
                <th>Applicants</th>
                <th>Jobs</th>
                <th>Careers URL</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    <div className="field-hint">{c.slug}</div>
                  </td>
                  <td><span className={`ats-status-badge ${c.status === 'active' ? 'open' : 'closed'}`}>{c.status}</span></td>
                  <td>{c.subscriptionStatus}</td>
                  <td>{c.stats.applicants}</td>
                  <td>{c.stats.jobs}</td>
                  <td>
                    <Link href={`/careers/${c.slug}`} target="_blank" className="saas-link">/careers/{c.slug}</Link>
                  </td>
                  <td>
                    <div className="super-admin-actions">
                      <button type="button" className="saas-btn saas-btn-sm saas-btn-outline" onClick={() => impersonate(c.id)} title="Impersonate"><Eye size={14} /></button>
                      <button type="button" className="saas-btn saas-btn-sm saas-btn-ghost" onClick={() => resetPassword(c.id)} title="Reset owner password">🔑</button>
                      {c.status === 'active' ? (
                        <button type="button" className="saas-btn saas-btn-sm saas-btn-ghost" onClick={() => toggleSuspend(c.id, true)} title="Suspend"><Ban size={14} /></button>
                      ) : (
                        <button type="button" className="saas-btn saas-btn-sm saas-btn-outline" onClick={() => toggleSuspend(c.id, false)}>Activate</button>
                      )}
                      {c.id !== 1 && (
                        <button type="button" className="saas-btn saas-btn-sm saas-btn-ghost danger" onClick={async () => {
                          if (!confirm(`Delete ${c.name}?`)) return;
                          const res = await fetch(`/api/super-admin/companies/${c.id}`, { method: 'DELETE' });
                          if (res.ok) { toast.success('Deleted'); load(); } else toast.error('Delete failed');
                        }}><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
