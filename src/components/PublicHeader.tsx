'use client';

import Link from 'next/link';
import { useConfig } from '@/components/ConfigProvider';

export default function PublicHeader() {
  const { config } = useConfig();
  const initial = config.storeName?.trim().charAt(0).toUpperCase() || 'H';

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt={config.storeName} className="careers-logo" style={{ height: 40 }} />
          ) : (
            <div className="logo-icon">{initial}</div>
          )}
          <div className="logo-text">
            <span className="logo-name">{config.storeName}</span>
            {config.storeAddress && (
              <span className="logo-address">{config.storeAddress}</span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
