'use client';

import {
  Users, UserPlus, Eye, Calendar, CheckCircle, XCircle, TrendingUp,
} from 'lucide-react';

const statConfig = [
  { key: 'Total', label: 'Total Applicants', icon: Users, color: '#6366f1', bg: '#eef2ff' },
  { key: 'New', label: 'New', icon: UserPlus, color: '#2563eb', bg: '#dbeafe' },
  { key: 'Reviewing', label: 'Reviewing', icon: Eye, color: '#d97706', bg: '#fef3c7' },
  { key: 'Interview', label: 'Interview', icon: Calendar, color: '#7c3aed', bg: '#ede9fe' },
  { key: 'Hired', label: 'Hired', icon: CheckCircle, color: '#16a34a', bg: '#dcfce7' },
  { key: 'Rejected', label: 'Rejected', icon: XCircle, color: '#dc2626', bg: '#fee2e2' },
];

export default function StatCards({
  stats,
  todayNew,
}: {
  stats: Record<string, number>;
  todayNew: number;
}) {
  return (
    <div className="saas-stat-grid">
      {statConfig.map(({ key, label, icon: Icon, color, bg }) => (
        <div key={key} className="saas-stat-card">
          <div className="saas-stat-icon" style={{ background: bg, color }}>
            <Icon size={22} />
          </div>
          <div className="saas-stat-body">
            <div className="saas-stat-label">{label}</div>
            <div className="saas-stat-value">{stats[key] ?? 0}</div>
            {key === 'New' && todayNew > 0 && (
              <div className="saas-stat-change">
                <TrendingUp size={12} /> +{todayNew} today
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
