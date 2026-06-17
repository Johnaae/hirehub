'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Search,
  Moon,
  Sun,
  QrCode,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCompanyCareerUrl, type CompanyCareerRef } from '@/lib/company-career';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/applicants', label: 'Applicants', icon: Users },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/interviews', label: 'Interviews', icon: Calendar },
  { href: '/admin/marketing/qr', label: 'QR Code', icon: QrCode },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({
  adminEmail,
  storeName,
  companyRef,
  onSearch,
}: {
  adminEmail?: string;
  storeName?: string;
  companyRef?: CompanyCareerRef | null;
  onSearch?: (q: string) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const publicSiteHref = companyRef?.id ? getCompanyCareerUrl(companyRef) : null;

  useEffect(() => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setDark(isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      setDark(true);
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/admin/applicants?search=${encodeURIComponent(searchQ.trim())}`);
      onSearch?.(searchQ.trim());
    }
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const sidebar = (
    <aside className="saas-sidebar">
      <div className="saas-sidebar-brand">
        <div className="saas-logo-badge">H</div>
        <div>
          <div className="saas-brand-name">{storeName || 'HireHub'}</div>
          <div className="saas-brand-sub">Hiring Management</div>
        </div>
      </div>

      <form className="saas-global-search" onSubmit={handleSearch}>
        <Search size={16} />
        <input
          type="search"
          placeholder="Search applicants..."
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
        />
      </form>

      <nav className="saas-nav">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`saas-nav-item ${isActive(href, exact) ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="saas-sidebar-footer">
        {publicSiteHref ? (
          <Link href={publicSiteHref} target="_blank" className="saas-nav-item">
            <ExternalLink size={18} />
            Public Site
          </Link>
        ) : (
          <span className="saas-nav-item disabled" title="Company slug not available">
            <ExternalLink size={18} />
            Public Site
          </span>
        )}
        <button type="button" className="saas-nav-item" onClick={toggleDark}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        {adminEmail && <div className="saas-admin-email">{adminEmail}</div>}
        <button type="button" className="saas-nav-item saas-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <button
        type="button"
        className="saas-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      {mobileOpen && <div className="saas-overlay" onClick={() => setMobileOpen(false)} />}
      <div className={`saas-sidebar-wrap ${mobileOpen ? 'open' : ''}`}>{sidebar}</div>
    </>
  );
}
