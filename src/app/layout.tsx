import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ConfigProvider } from '@/components/ConfigProvider';
import { getStoreConfig } from '@/lib/config';
import '@uploadthing/react/styles.css';
import './globals.css';
import './saas.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: config.storeName,
    description: 'Apply online to join our team at The UPS Store.',
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getStoreConfig();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <style>{`:root { --primary: ${config.primaryColor}; --accent: ${config.accentColor}; }`}</style>
      </head>
      <body className={inter.className}>
        <ConfigProvider initialConfig={config}>{children}</ConfigProvider>
      </body>
    </html>
  );
}
