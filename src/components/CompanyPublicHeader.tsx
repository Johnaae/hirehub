'use client';

import Link from 'next/link';

interface CompanyPublicHeaderProps {
  storeName: string;
  storeAddress?: string;
  logoUrl?: string;
  primaryColor?: string;
  href?: string;
}

export default function CompanyPublicHeader({
  storeName,
  storeAddress,
  logoUrl,
  href = '/',
}: CompanyPublicHeaderProps) {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href={href} className="logo">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="public-header-logo" />
          ) : (
            <div className="logo-text-only">{storeName}</div>
          )}
          {storeAddress && !logoUrl && (
            <span className="logo-address">{storeAddress}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
