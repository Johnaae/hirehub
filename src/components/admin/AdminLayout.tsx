'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Toaster } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [adminEmail, setAdminEmail] = useState('');
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    fetch('/api/admin/me').then((r) => r.json()).then((d) => d.admin && setAdminEmail(d.admin.email));
    fetch('/api/config').then((r) => r.json()).then((d) => setStoreName(d.storeName));
  }, []);

  return (
    <div className="saas-admin">
      <AdminSidebar adminEmail={adminEmail} storeName={storeName} />
      <main className="saas-main">{children}</main>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
