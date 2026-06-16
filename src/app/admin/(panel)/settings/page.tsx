'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', address: '', phone: '', email: '', description: '',
    logoUrl: '', primaryColor: '#351C15', accentColor: '#FFB500',
    settings: { ownerEmail: '', smtpHost: '', smtpPort: '587', smtpUser: '', smtpPass: '', uploadProvider: 'uploadthing' },
  });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.company) {
          setForm({
            name: d.company.name || '',
            address: d.company.address || '',
            phone: d.company.phone || '',
            email: d.company.email || '',
            description: d.company.description || '',
            logoUrl: d.company.logoUrl || '',
            primaryColor: d.company.primaryColor || '#351C15',
            accentColor: d.company.accentColor || '#FFB500',
            settings: {
              ownerEmail: d.company.settings?.ownerEmail || '',
              smtpHost: d.company.settings?.smtpHost || '',
              smtpPort: String(d.company.settings?.smtpPort || '587'),
              smtpUser: d.company.settings?.smtpUser || '',
              smtpPass: d.company.settings?.smtpPass || '',
              uploadProvider: d.company.settings?.uploadProvider || 'uploadthing',
            },
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success('Settings saved');
      document.documentElement.style.setProperty('--primary', form.primaryColor);
      document.documentElement.style.setProperty('--accent', form.accentColor);
    } else {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) return <div className="saas-loading">Loading settings...</div>;

  return (
    <div className="saas-page">
      <div className="saas-page-header">
        <div>
          <h1>Settings</h1>
          <p className="saas-subtitle">Configure your hiring portal</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="saas-settings-form">
        <div className="saas-card">
          <h3>Company Information</h3>
          <div className="saas-form-row">
            <div className="saas-form-group"><label>Store Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="saas-form-group"><label>Logo URL</label><input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." /></div>
          </div>
          <div className="saas-form-group"><label>Address</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="saas-form-row">
            <div className="saas-form-group"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="saas-form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="saas-form-group"><label>Company Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>

        <div className="saas-card">
          <h3>Branding</h3>
          <div className="saas-form-row">
            <div className="saas-form-group">
              <label>Primary Color</label>
              <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
            </div>
            <div className="saas-form-group">
              <label>Accent Color</label>
              <input type="color" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="saas-card">
          <h3>Email (SMTP)</h3>
          <div className="saas-form-row">
            <div className="saas-form-group"><label>Owner Email</label><input value={form.settings.ownerEmail} onChange={(e) => setForm({ ...form, settings: { ...form.settings, ownerEmail: e.target.value } })} /></div>
            <div className="saas-form-group"><label>SMTP Host</label><input value={form.settings.smtpHost} onChange={(e) => setForm({ ...form, settings: { ...form.settings, smtpHost: e.target.value } })} /></div>
          </div>
          <div className="saas-form-row">
            <div className="saas-form-group"><label>SMTP Port</label><input value={form.settings.smtpPort} onChange={(e) => setForm({ ...form, settings: { ...form.settings, smtpPort: e.target.value } })} /></div>
            <div className="saas-form-group"><label>SMTP User</label><input value={form.settings.smtpUser} onChange={(e) => setForm({ ...form, settings: { ...form.settings, smtpUser: e.target.value } })} /></div>
            <div className="saas-form-group"><label>SMTP Password</label><input type="password" value={form.settings.smtpPass} onChange={(e) => setForm({ ...form, settings: { ...form.settings, smtpPass: e.target.value } })} /></div>
          </div>
        </div>

        <div className="saas-card">
          <h3>File Storage</h3>
          <div className="saas-form-group">
            <label>Upload Provider</label>
            <select value={form.settings.uploadProvider} onChange={(e) => setForm({ ...form, settings: { ...form.settings, uploadProvider: e.target.value } })}>
              <option value="uploadthing">UploadThing</option>
            </select>
          </div>
        </div>

        <button type="submit" className="saas-btn saas-btn-primary" disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
