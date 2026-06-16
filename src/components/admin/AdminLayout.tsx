'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Toaster, toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [adminEmail, setAdminEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [impersonating, setImpersonating] = useState<{ name: string; slug: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.admin) setAdminEmail(d.admin.email || d.admin.name || '');
        if (d.impersonateCompanyId && d.company) {
          setImpersonating({ name: d.company.name, slug: d.company.slug });
          setStoreName(d.company.name);
        } else {
          fetch('/api/config').then((r) => r.json()).then((cfg) => setStoreName(cfg.storeName));
        }
      });
  }, []);

  const stopImpersonating = async () => {
    const res = await fetch('/api/super-admin/impersonate', { method: 'DELETE' });
    if (res.ok) {
      toast.success('Impersonation ended');
      window.location.href = '/super-admin';
    }
  };

  return (
    <div className="saas-admin">
      {impersonating && (
        <div className="impersonation-banner">
          <span>Viewing as <strong>{impersonating.name}</strong></span>
          <button type="button" className="saas-btn saas-btn-sm saas-btn-outline" onClick={stopImpersonating}>
            Exit Impersonation
          </button>
        </div>
      )}
      <AdminSidebar adminEmail={adminEmail} storeName={storeName} />
      <main className="saas-main">{children}</main>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
