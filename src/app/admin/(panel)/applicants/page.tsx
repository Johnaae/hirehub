'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, ChevronLeft, ChevronRight, Download, FileText,
  MoreHorizontal, ExternalLink,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { STATUSES } from '@/lib/constants';
import { toast } from 'sonner';

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
  resumeFilename: string | null;
  resumeUrl: string | null;
}

function ApplicantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applicants, setApplicants] = useState<ApplicantRow[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });
  const [statusMenu, setStatusMenu] = useState<number | null>(null);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (positionFilter) params.set('position', positionFilter);
    params.set('sort', sort);
    params.set('page', String(page));

    const res = await fetch(`/api/admin/applicants?${params}`);
    const data = await res.json();
    if (res.ok) {
      setApplicants(data.applicants);
      setPagination(data.pagination);
      setPositions(data.positions || []);
    }
    setLoading(false);
  }, [search, statusFilter, positionFilter, sort, page]);

  useEffect(() => {
    const t = setTimeout(fetchApplicants, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchApplicants, search]);

  const updateStatus = async (id: number, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusMenu(null);
    const res = await fetch(`/api/admin/applicants/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Status updated to ${status}`);
      fetchApplicants();
    } else {
      toast.error('Failed to update status');
    }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const initials = (f: string, l: string) => `${f[0] || ''}${l[0] || ''}`.toUpperCase();

  return (
    <div className="saas-page">
      <div className="saas-page-header">
        <div>
          <h1>Applicants</h1>
          <p className="saas-subtitle">{pagination.total} total applications</p>
        </div>
        <div className="saas-header-actions">
          <a href="/api/admin/export?format=csv" className="saas-btn saas-btn-outline saas-btn-sm">
            <Download size={16} /> CSV
          </a>
          <a href="/api/admin/export?format=xlsx" className="saas-btn saas-btn-outline saas-btn-sm">
            <Download size={16} /> Excel
          </a>
          <a href="/api/admin/export?format=pdf" className="saas-btn saas-btn-outline saas-btn-sm">
            <Download size={16} /> PDF
          </a>
        </div>
      </div>

      <div className="saas-filters saas-card">
        <div className="saas-search-wrap">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={positionFilter} onChange={(e) => { setPositionFilter(e.target.value); setPage(1); }}>
          <option value="">All Positions</option>
          {positions.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="saas-card saas-table-wrap">
        {loading ? (
          <div className="saas-loading">Loading applicants...</div>
        ) : applicants.length === 0 ? (
          <div className="saas-empty-state">
            <FileText size={48} strokeWidth={1} />
            <h3>No applicants found</h3>
            <p>Try adjusting your filters or wait for new applications.</p>
          </div>
        ) : (
          <table className="saas-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Position</th>
                <th>Applied</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Resume</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a) => (
                <tr key={a.id} className="saas-table-row" onClick={() => router.push(`/admin/applicants/${a.id}`)}>
                  <td>
                    <div className="saas-applicant-cell">
                      <div className="saas-avatar">{initials(a.firstName, a.lastName)}</div>
                      <div>
                        <strong>{a.firstName} {a.lastName}</strong>
                        <span className="saas-cell-meta">{a.employmentType}</span>
                      </div>
                    </div>
                  </td>
                  <td>{a.position}</td>
                  <td>{fmt(a.createdAt)}</td>
                  <td>{a.phone}</td>
                  <td className="saas-cell-email">{a.email}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {a.resumeFilename ? (
                      <a href={`/api/admin/applicants/${a.id}/resume`} target="_blank" rel="noopener" className="saas-resume-link">
                        <FileText size={14} /> PDF
                      </a>
                    ) : '—'}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <StatusBadge status={a.status} />
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="saas-actions-cell">
                      <button
                        type="button"
                        className="saas-icon-btn"
                        onClick={(e) => { e.stopPropagation(); setStatusMenu(statusMenu === a.id ? null : a.id); }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {statusMenu === a.id && (
                        <div className="saas-dropdown">
                          {STATUSES.map((s) => (
                            <button key={s} type="button" onClick={(e) => updateStatus(a.id, s, e)}>
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pagination.totalPages > 1 && (
          <div className="saas-pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="saas-btn saas-btn-ghost saas-btn-sm">
              <ChevronLeft size={16} /> Prev
            </button>
            <span>Page {page} of {pagination.totalPages}</span>
            <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="saas-btn saas-btn-ghost saas-btn-sm">
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicantsPage() {
  return (
    <Suspense fallback={<div className="saas-loading">Loading...</div>}>
      <ApplicantsContent />
    </Suspense>
  );
}
