'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Briefcase, Search, Filter, LayoutTemplate } from 'lucide-react';
import { toast } from 'sonner';
import JobCard, { type JobCardData } from '@/components/admin/JobCard';
import JobFormPanel, { type JobLookups, type JobTemplate, type JobFormValues } from '@/components/admin/JobFormPanel';
import { linesToArray } from '@/lib/jobs';
import { JOB_STATUSES } from '@/lib/jobs';

interface JobStats {
  Open: number;
  Closed: number;
  Draft: number;
  Archived: number;
  Total: number;
}

const EMPTY_LOOKUPS: JobLookups = {
  department: [],
  job_title: [],
  employment_type: [],
  salary_range: [],
  location: [],
  requirement: [],
  benefit: [],
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [stats, setStats] = useState<JobStats>({ Open: 0, Closed: 0, Draft: 0, Archived: 0, Total: 0 });
  const [lookups, setLookups] = useState<JobLookups>(EMPTY_LOOKUPS);
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formInitial, setFormInitial] = useState<Partial<JobFormValues>>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const loadJobs = useCallback(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (statusFilter) params.set('status', statusFilter);
    if (deptFilter) params.set('department', deptFilter);

    return fetch(`/api/admin/jobs?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setJobs(d.jobs || []);
        if (d.stats) setStats(d.stats);
      });
  }, [search, statusFilter, deptFilter]);

  const loadMeta = () =>
    Promise.all([
      fetch('/api/admin/jobs/lookups').then((r) => r.json()),
      fetch('/api/admin/jobs/templates').then((r) => r.json()),
    ]).then(([lookupData, templateData]) => {
      if (lookupData.lookups) setLookups(lookupData.lookups);
      if (templateData.templates) setTemplates(templateData.templates);
    });

  useEffect(() => {
    setLoading(true);
    Promise.all([loadJobs(), loadMeta()]).finally(() => setLoading(false));
  }, [loadJobs]);

  const openCreate = () => {
    setEditingId(null);
    setFormInitial({});
    setShowForm(true);
  };

  const openEdit = async (job: JobCardData) => {
    setEditingId(job.id);
    const res = await fetch(`/api/admin/jobs/${job.id}`);
    const data = await res.json();
    if (data.job) {
      const j = data.job;
      setFormInitial({
        title: j.title,
        department: j.department || '',
        employmentType: j.employmentType,
        salary: j.salary || '',
        location: j.location || '',
        description: j.description,
        requirements: linesToArray(j.requirements),
        benefits: linesToArray(j.benefits),
        status: j.status,
      });
    }
    setShowForm(true);
  };

  const handleDuplicate = async (id: number) => {
    const res = await fetch(`/api/admin/jobs/${id}/duplicate`, { method: 'POST' });
    if (res.ok) {
      toast.success('Job duplicated as draft');
      loadJobs();
    } else toast.error('Failed to duplicate');
  };

  const handleArchive = async (id: number) => {
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Archived' }),
    });
    if (res.ok) { toast.success('Job archived'); loadJobs(); }
    else toast.error('Failed to archive');
  };

  const handlePublish = async (id: number) => {
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Open' }),
    });
    if (res.ok) { toast.success('Job published'); loadJobs(); }
    else toast.error('Failed to publish');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this job posting?')) return;
    const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Job deleted'); loadJobs(); }
    else toast.error('Failed to delete');
  };

  const statCards = [
    { label: 'All Jobs', value: stats.Total, filter: '' },
    { label: 'Open', value: stats.Open, filter: 'Open' },
    { label: 'Draft', value: stats.Draft, filter: 'Draft' },
    { label: 'Closed', value: stats.Closed, filter: 'Closed' },
    { label: 'Archived', value: stats.Archived, filter: 'Archived' },
  ];

  return (
    <div className="saas-page ats-jobs-page">
      <div className="saas-page-header">
        <div>
          <h1>Job Management</h1>
          <p className="saas-subtitle">Create, publish, and manage job postings</p>
        </div>
        <button type="button" className="saas-btn saas-btn-primary" onClick={openCreate}>
          <Plus size={16} /> Create Job
        </button>
      </div>

      <div className="ats-stats-row">
        {statCards.map((s) => (
          <button
            key={s.label}
            type="button"
            className={`ats-stat-card ${statusFilter === s.filter ? 'active' : ''}`}
            onClick={() => setStatusFilter(s.filter)}
          >
            <span className="ats-stat-value">{s.value}</span>
            <span className="ats-stat-label">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="ats-toolbar">
        <div className="ats-search-wrap">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search jobs by title, department, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ats-filters">
          <Filter size={16} />
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {lookups.department.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {templates.length > 0 && !showForm && (
        <div className="ats-templates-banner">
          <LayoutTemplate size={18} />
          <span>{templates.length} job templates available — create a job to start from a template</span>
        </div>
      )}

      {loading ? (
        <div className="saas-loading">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="saas-empty-state">
          <Briefcase size={48} strokeWidth={1} />
          <h3>{search || statusFilter || deptFilter ? 'No matching jobs' : 'No jobs yet'}</h3>
          <p>{search || statusFilter || deptFilter ? 'Try adjusting your filters.' : 'Create your first job posting to get started.'}</p>
          {!search && !statusFilter && !deptFilter && (
            <button type="button" className="saas-btn saas-btn-primary" onClick={openCreate}>
              <Plus size={16} /> Create Job
            </button>
          )}
        </div>
      ) : (
        <div className="ats-jobs-grid">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={openEdit}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onPublish={handlePublish}
            />
          ))}
        </div>
      )}

      {showForm && (
        <JobFormPanel
          editingId={editingId}
          initialValues={formInitial}
          lookups={lookups}
          templates={templates}
          onClose={() => setShowForm(false)}
          onSaved={loadJobs}
          onLookupsChange={setLookups}
          onTemplatesChange={setTemplates}
        />
      )}
    </div>
  );
}
