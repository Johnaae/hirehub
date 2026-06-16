'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

const COLORS = ['#2563eb', '#d97706', '#7c3aed', '#16a34a', '#dc2626', '#6366f1'];

export default function DashboardCharts({
  applicantsByDay,
  applicantsByStatus,
  applicantsByPosition,
}: {
  applicantsByDay: { date: string; count: number }[];
  applicantsByStatus: { status: string; count: number }[];
  applicantsByPosition: { position: string; count: number }[];
}) {
  const dayData = applicantsByDay.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const positionData = applicantsByPosition.map((p) => ({
    name: p.position.length > 20 ? p.position.slice(0, 20) + '…' : p.position,
    count: p.count,
  }));

  return (
    <div className="saas-charts-grid">
      <div className="saas-card saas-chart-card">
        <h3>Applicants This Month</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={dayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--text-muted)" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--text-muted)" />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="saas-card saas-chart-card">
        <h3>By Status</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={applicantsByStatus}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ status, count }) => `${status}: ${count}`}
            >
              {applicantsByStatus.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="saas-card saas-chart-card saas-chart-wide">
        <h3>By Position</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={positionData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
