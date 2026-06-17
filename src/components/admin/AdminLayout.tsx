'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Toaster, toast } from 'sonner';
import type { CompanyCareerRef } from '@/lib/company-career';

export const COMPANY_UPDATED_EVENT = 'hirehub:company-updated';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [adminEmail, setAdminEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [companyRef, setCompanyRef] = useState<CompanyCareerRef>({ id: 0, slug: '' });
  const [impersonating, setImpersonating] = useState<{ name: string; slug: string } | null>(null);

  const applyCompany = (company: { id: number; slug?: string | null; name?: string }) => {
    if (company.slug) setCompanyRef({ id: company.id, slug: company.slug });
    else setCompanyRef({ id: company.id, slug: null });
    if (company.name) setStoreName(company.name);
  };

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.admin) setAdminEmail(d.admin.email || d.admin.name || '');
        if (d.company) {
          applyCompany(d.company);
          if (d.impersonateCompanyId) {
            setImpersonating({ name: d.company.name, slug: d.company.slug });
          }
        }
      });

    const onCompanyUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id: number; slug?: string; name?: string };
      if (detail) applyCompany(detail);
    };
    window.addEventListener(COMPANY_UPDATED_EVENT, onCompanyUpdated);
    return () => window.removeEventListener(COMPANY_UPDATED_EVENT, onCompanyUpdated);
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
      <AdminSidebar adminEmail={adminEmail} storeName={storeName} companyRef={companyRef.id ? companyRef : null} />
      <main className="saas-main">{children}</main>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
