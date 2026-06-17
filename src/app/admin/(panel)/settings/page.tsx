'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Save, Building2, Palette, Mail, ShieldCheck, Copy, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import AccountSecuritySection from '@/components/admin/settings/AccountSecuritySection';
import { getCompanyCareerPath, getCompanyCareerUrl, type CompanyCareerRef } from '@/lib/company-career';
import { COMPANY_UPDATED_EVENT } from '@/components/admin/AdminLayout';
import { COMPANY_INDUSTRIES, INDUSTRY_LABELS, type CompanyIndustry } from '@/lib/industry';

type SettingsTab = 'company' | 'branding' | 'email' | 'account';

const TABS: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'email', label: 'Email Notifications', icon: Mail },
  { id: 'account', label: 'Account & Security', icon: ShieldCheck },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sharedEmailConfigured, setSharedEmailConfigured] = useState(false);
  const [companyId, setCompanyId] = useState(0);
  const [form, setForm] = useState({
    name: '', slug: '', industry: 'SHIPPING_RETAIL' as CompanyIndustry, address: '', phone: '', email: '', website: '', description: '',
    careerPageBanner: '',
    logoUrl: '', primaryColor: '#351C15', accentColor: '#FFB500',
    settings: {
      uploadProvider: 'uploadthing',
    },
  });

  const companyRef: CompanyCareerRef = { id: companyId, slug: form.slug || null };
  const careerPath = companyId ? getCompanyCareerPath(companyRef) : '';
  const careerUrl = companyId ? getCompanyCareerUrl(companyRef) : '';

  const copyCareerUrl = () => {
    if (!careerUrl) return;
    navigator.clipboard.writeText(careerUrl);
    toast.success('Career page link copied');
  };

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.company) {
          setCompanyId(d.company.id);
          setForm({
            name: d.company.name || '',
            slug: d.company.slug || '',
            industry: d.company.industry || 'SHIPPING_RETAIL',
            address: d.company.address || '',
            phone: d.company.phone || '',
            email: d.company.email || '',
            website: d.company.website || '',
            description: d.company.description || '',
            careerPageBanner: d.company.careerPageBanner || '',
            logoUrl: d.company.logoUrl || '',
            primaryColor: d.company.primaryColor || '#351C15',
            accentColor: d.company.accentColor || '#FFB500',
            settings: {
              uploadProvider: d.company.settings?.uploadProvider || 'uploadthing',
            },
          });
          setSharedEmailConfigured(!!d.company.settings?.sharedSmtpConfigured);
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
      const data = await res.json();
      toast.success('Settings saved');
      document.documentElement.style.setProperty('--primary', form.primaryColor);
      document.documentElement.style.setProperty('--accent', form.accentColor);
      if (data.company) {
        setCompanyId(data.company.id);
        setForm((prev) => ({
          ...prev,
          slug: data.company.slug || prev.slug,
          name: data.company.name || prev.name,
          industry: data.company.industry || prev.industry,
          settings: {
            ...prev.settings,
            uploadProvider: data.company.settings?.uploadProvider || prev.settings.uploadProvider,
          },
        }));
        setSharedEmailConfigured(!!data.company.settings?.sharedSmtpConfigured);
        window.dispatchEvent(new CustomEvent(COMPANY_UPDATED_EVENT, { detail: data.company }));
      }
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || 'Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) return <div className="saas-loading">Loading settings...</div>;

  return (
    <div className="saas-page settings-page">
      <div className="saas-page-header">
        <div>
          <h1>Settings</h1>
          <p className="saas-subtitle">Configure your hiring portal and owner account</p>
        </div>
      </div>

      <div className="settings-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`settings-tab ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'account' ? (
        <AccountSecuritySection />
      ) : (
        <form onSubmit={handleSave} className="saas-settings-form">
          {activeTab === 'company' && (
            <div className="saas-card settings-card">
              <div className="settings-card-header">
                <Building2 size={20} />
                <div>
                  <h3>Company Information</h3>
                  <p>Public details shown on your hiring portal</p>
                </div>
              </div>
              <div className="saas-form-group">
                <label>Store Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="saas-form-group">
                <label>Industry</label>
                <select
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value as CompanyIndustry })}
                >
                  {COMPANY_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{INDUSTRY_LABELS[ind]}</option>
                  ))}
                </select>
                <span className="field-hint">Job templates shown when creating positions are based on your industry</span>
              </div>
              <div className="saas-form-group">
                <label>Public URL Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  placeholder="your-store-name"
                />
                <span className="field-hint">Used in your career page URL: {careerPath || '/careers/your-slug'}</span>
              </div>
              {careerPath && (
                <div className="career-url-copy">
                  <ExternalLink size={16} />
                  <code>{careerPath}</code>
                  <button type="button" className="saas-btn saas-btn-sm saas-btn-outline" onClick={copyCareerUrl}>
                    <Copy size={14} /> Copy link
                  </button>
                  <Link href={careerPath} target="_blank" className="saas-link">Preview</Link>
                </div>
              )}
              <div className="saas-form-group">
                <label>Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="saas-form-row">
                <div className="saas-form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="saas-form-group">
                  <label>Company Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contact@yourstore.com"
                  />
                  <span className="field-hint">Public contact email (not your login email)</span>
                </div>
              </div>
              <div className="saas-form-group">
                <label>Hero Subtitle</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description shown below the hero title on your careers page"
                />
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="saas-card settings-card">
              <div className="settings-card-header">
                <Palette size={20} />
                <div>
                  <h3>Branding</h3>
                  <p>Customize colors and logo for your portal</p>
                </div>
              </div>
              <div className="saas-form-group">
                <label>Logo URL</label>
                <input
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="saas-form-group">
                <label>Hero Title</label>
                <input
                  value={form.careerPageBanner}
                  onChange={(e) => setForm({ ...form, careerPageBanner: e.target.value })}
                  placeholder={`Join ${form.name || 'Our Team'}`}
                />
                <span className="field-hint">Main headline on your public careers page</span>
              </div>
              <div className="saas-form-row">
                <div className="saas-form-group">
                  <label>Primary Color</label>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    />
                    <span>{form.primaryColor}</span>
                  </div>
                </div>
                <div className="saas-form-group">
                  <label>Accent Color</label>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                    />
                    <span>{form.accentColor}</span>
                  </div>
                </div>
              </div>
              <div className="branding-preview">
                <div className="branding-preview-bar" style={{ background: form.primaryColor, color: form.accentColor }}>
                  {form.name || 'Your Store'}
                </div>
                <button type="button" className="saas-btn saas-btn-sm" style={{ background: form.accentColor, color: form.primaryColor }}>
                  Apply Now
                </button>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <>
              <div className="saas-card settings-card">
                <div className="settings-card-header">
                  <Mail size={20} />
                  <div>
                    <h3>Email Notifications</h3>
                    <p>Applicant and interview emails are sent through HireHub&apos;s shared notification service</p>
                  </div>
                </div>

                <div className={`settings-info-banner ${sharedEmailConfigured ? 'success' : ''}`}>
                  {sharedEmailConfigured ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>
                    <strong>{sharedEmailConfigured ? 'Email configured' : 'Email not configured'}</strong>
                    {sharedEmailConfigured
                      ? ` — emails are sent as "${form.name || 'Your Company'} via HireHub". Applicant replies go to your company email.`
                      : ' — platform SMTP is not configured yet. Contact your HireHub administrator.'}
                  </span>
                </div>

                <div className="settings-info-banner">
                  <ShieldCheck size={16} />
                  <span>
                    Set your <strong>Company Email</strong> in the Company tab so applicant replies reach your business.
                    Set your <strong>notification email</strong> in{' '}
                    <button type="button" className="settings-inline-link" onClick={() => setActiveTab('account')}>
                      Account & Security
                    </button>{' '}
                    to receive new applicant alerts.
                  </span>
                </div>
              </div>

              <div className="saas-card settings-card">
                <h3>File Storage</h3>
                <div className="saas-form-group">
                  <label>Upload Provider</label>
                  <select
                    value={form.settings.uploadProvider}
                    onChange={(e) => setForm({ ...form, settings: { ...form.settings, uploadProvider: e.target.value } })}
                  >
                    <option value="uploadthing">UploadThing</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="saas-btn saas-btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  );
}
