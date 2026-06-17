import Link from 'next/link';

interface HireHubLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  href?: string;
  showWordmark?: boolean;
}

export default function HireHubLogo({
  size = 'md',
  variant = 'dark',
  href,
  showWordmark = true,
}: HireHubLogoProps) {
  const content = (
    <span className={`hh-logo hh-logo--${size} hh-logo--${variant}`}>
      <span className="hh-logo-mark" aria-hidden="true">H</span>
      {showWordmark && <span className="hh-logo-wordmark">HireHub</span>}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="hh-logo-link" aria-label="HireHub home">
        {content}
      </Link>
    );
  }

  return content;
}
