'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { StoreConfig } from '@/lib/config';

const defaultConfig: StoreConfig = {
  storeName: 'The UPS Store Hiring Portal',
  storeAddress: '',
  ownerEmail: '',
  primaryColor: '#351C15',
  accentColor: '#FFB500',
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

    fetch('/api/config')
      .then((r) => r.json())
      .then((data: StoreConfig) => {
        setConfig(data);
        applyTheme(data);
      })
      .catch(() => applyTheme(defaultConfig))
      .finally(() => setLoading(false));
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
