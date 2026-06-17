'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { StoreConfig } from '@/lib/config';

const defaultConfig: StoreConfig = {
  companyId: 0,
  companySlug: '',
  storeName: 'HireHub',
  storeAddress: '',
  storePhone: '',
  storeWebsite: '',
  ownerEmail: '',
  primaryColor: '#1e3a5f',
  accentColor: '#3b82f6',
  heroTitle: 'Hiring portals for local businesses',
  heroSubtitle: '',
  description: '',
  logoUrl: '',
  timezone: 'America/New_York',
  footer: '',
  socialLinks: {},
};

const ConfigContext = createContext<{ config: StoreConfig; loading: boolean }>({
  config: defaultConfig,
  loading: true,
});

export function ConfigProvider({
  children,
  initialConfig,
}: {
  children: ReactNode;
  initialConfig?: StoreConfig;
}) {
  const [config, setConfig] = useState<StoreConfig>(initialConfig || defaultConfig);
  const [loading, setLoading] = useState(!initialConfig);

  useEffect(() => {
    if (initialConfig) {
      applyTheme(initialConfig);
      return;
    }
    // Root pages use neutral HireHub branding — company pages apply their own theme
    applyTheme(defaultConfig);
    setLoading(false);
  }, [initialConfig]);

  return (
    <ConfigContext.Provider value={{ config, loading }}>
      {children}
    </ConfigContext.Provider>
  );
}

function applyTheme(config: StoreConfig) {
  document.documentElement.style.setProperty('--primary', config.primaryColor);
  document.documentElement.style.setProperty('--accent', config.accentColor);
}

export function useConfig() {
  return useContext(ConfigContext);
}
