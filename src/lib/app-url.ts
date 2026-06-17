/**
 * Canonical public origin for career links, QR codes, and share URLs.
 * Uses NEXT_PUBLIC_APP_URL in production; never VERCEL_URL or deployment preview hosts.
 */
export function getPublicAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return origin;
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  return '';
}
