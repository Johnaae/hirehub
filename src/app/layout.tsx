import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ConfigProvider } from '@/components/ConfigProvider';
import '@uploadthing/react/styles.css';
import './globals.css';
import './saas.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'HireHub — Hiring portals for local businesses',
  description: 'HireHub gives every business its own branded careers page and applicant tracking.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <style>{`:root { --primary: #1e3a5f; --accent: #3b82f6; }`}</style>
      </head>
      <body className={inter.className}>
        <ConfigProvider>{children}</ConfigProvider>
      </body>
    </html>
  );
}
