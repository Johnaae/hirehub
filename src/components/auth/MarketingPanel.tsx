import Link from 'next/link';
import { LayoutTemplate, Users, CalendarCheck } from 'lucide-react';

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: 'Branded career pages',
    description: 'Launch a careers page that matches your brand in minutes.',
  },
  {
    icon: Users,
    title: 'Applicant tracking',
    description: 'Review, filter, and manage candidates in one place.',
  },
  {
    icon: CalendarCheck,
    title: 'Interview scheduling',
    description: 'Coordinate interviews and keep your pipeline moving.',
  },
] as const;

export default function MarketingPanel() {
  return (
    <div className="marketing-panel">
      <Link href="/" className="marketing-panel-logo" aria-label="HireHub home">
        <span className="marketing-panel-logo-mark" aria-hidden="true">H</span>
        <span className="marketing-panel-logo-name">HireHub</span>
      </Link>

      <h1 className="marketing-panel-headline">Hiring made simple.</h1>
      <p className="marketing-panel-subtitle">
        Create beautiful career pages, manage applicants, schedule interviews, and hire faster.
      </p>

      <div className="marketing-panel-features">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="marketing-panel-feature">
            <div className="marketing-panel-feature-icon">
              <Icon size={20} strokeWidth={2} />
            </div>
            <div>
              <strong>{title}</strong>
              <span>{description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
