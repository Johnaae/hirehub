'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { POSITIONS, STATUSES } from '@/lib/constants';

interface ApplicantRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  employmentType: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<ApplicantRow[]>([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.admin) setAdminEmail(data.admin.email);
      })
      .catch(() => {});
  }, []);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (positionFilter) params.set('position', positionFilter);
      params.set('sort', 'newest');

      const response = await fetch(`/api/admin/applicants?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load applicants');
      setApplicants(data.applicants);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, positionFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchApplicants, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchApplicants, search]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="page admin-page">
      <AdminHeader adminEmail={adminEmail} />
      <main className="admin-main">
        <div className="container">
          <div className="admin-page-header">
            <div>
              <h1>Applicants</h1>
              <p className="text-muted">Manage and review job applications</p>
            </div>
            {!loading && (
              <span className="applicant-count">
                {applicants.length} application{applicants.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="filters-bar card">
            <div className="filter-group">
              <label htmlFor="search">Search</label>
              <input id="search" type="search" placeholder="Name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="filter-group">
              <label htmlFor="statusFilter">Status</label>
              <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="positionFilter">Position</label>
              <select id="positionFilter" value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)}>
                <option value="">All Positions</option>
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading-container"><LoadingSpinner size="lg" /></div>
          ) : applicants.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">📋</div>
              <h3>No applications found</h3>
              <p>{search || statusFilter || positionFilter ? 'Try adjusting your search or filters.' : 'Applications will appear here when candidates apply.'}</p>
            </div>
          ) : (
            <div className="table-card card">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Position</th>
                      <th>Type</th>
                      <th>Submitted</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((a) => (
                      <tr key={a.id} className="table-row-clickable" onClick={() => router.push(`/admin/applicants/${a.id}`)}>
                        <td className="cell-name">{a.firstName} {a.lastName}</td>
                        <td>{a.email}</td>
                        <td>{a.phone}</td>
                        <td>{a.position}</td>
                        <td>{a.employmentType}</td>
                        <td>{formatDate(a.createdAt)}</td>
                        <td><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
