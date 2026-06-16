'use client';

import Link from 'next/link';
import { useConfig } from '@/components/ConfigProvider';

export default function PublicHeader() {
  const { config } = useConfig();

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          <div className="logo-icon">UPS</div>
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
