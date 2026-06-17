'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useConfig } from '@/components/ConfigProvider';

interface AdminHeaderProps {
  adminEmail?: string;
}

export default function AdminHeader({ adminEmail }: AdminHeaderProps) {
  const { config } = useConfig();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="header admin-header">
      <div className="container header-inner">
        <Link href="/admin" className="logo">
          <div className="logo-icon">{config.storeName?.trim().charAt(0).toUpperCase() || 'H'}</div>
          <div className="logo-text">
            <span className="logo-name">{config.storeName}</span>
            <span className="logo-subtitle">Admin Dashboard</span>
          </div>
        </Link>
        <div className="admin-nav">
          <Link href="/" className="btn btn-ghost btn-sm" target="_blank">
            View Public Site
          </Link>
          {adminEmail && <span className="admin-email">{adminEmail}</span>}
          <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
