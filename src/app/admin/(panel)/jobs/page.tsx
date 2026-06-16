'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Users, MapPin, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface Job {
  id: number;
  title: string;
  slug: string;
  department: string | null;
  employmentType: string;
  location: string | null;
  salary: string | null;
  status: string;
  _count: { applicants: number };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState({
    title: '', department: '', employmentType: 'Full-Time',
    salary: '', location: '', description: '', requirements: '', benefits: '', status: 'Open',
  });

  const load = () => {
    fetch('/api/admin/jobs').then((r) => r.json()).then((d) => setJobs(d.jobs || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: '', department: '', employmentType: 'Full-Time', salary: '', location: '', description: '', requirements: '', benefits: '', status: 'Open' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/admin/jobs/${editing.id}` : '/api/admin/jobs';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      toast.success(editing ? 'Job updated' : 'Job created');
      resetForm();
      load();
    } else {
      toast.error('Failed to save job');
    }
  };

  const handleEdit = (job: Job) => {
    setEditing(job);
    setForm({
      title: job.title, department: job.department || '', employmentType: job.employmentType,
      salary: job.salary || '', location: job.location || '', description: '',
      requirements: '', benefits: '', status: job.status,
    });
    fetch(`/api/admin/jobs/${job.id}`).then((r) => r.json()).then((d) => {
      if (d.job) setForm((f) => ({ ...f, description: d.job.description, requirements: d.job.requirements || '', benefits: d.job.benefits || '' }));
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this job?')) return;
    const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Job deleted'); load(); }
    else toast.error('Failed to delete');
  };

  const toggleStatus = async (job: Job) => {
    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    await fetch(`/api/admin/jobs/${job.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    toast.success(`Job ${newStatus.toLowerCase()}`);
    load();
  };

  return (
    <div className="saas-page">
      <div className="saas-page-header">
        <div>
          <h1>Job Management</h1>
          <p className="saas-subtitle">Create and manage open positions</p>
        </div>
        <button type="button" className="saas-btn saas-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} /> Create Job
        </button>
      </div>

      {showForm && (
        <div className="saas-card saas-job-form">
          <h3>{editing ? 'Edit Job' : 'New Job'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="saas-form-row">
              <div className="saas-form-group"><label>Title *</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="saas-form-group"><label>Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            </div>
            <div className="saas-form-row">
              <div className="saas-form-group">
                <label>Employment Type</label>
                <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
                  <option>Full-Time</option><option>Part-Time</option><option>Contract</option>
                </select>
              </div>
              <div className="saas-form-group"><label>Salary</label><input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. $15-18/hr" /></div>
              <div className="saas-form-group"><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            </div>
            <div className="saas-form-group"><label>Description *</label><textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="saas-form-group"><label>Requirements</label><textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></div>
            <div className="saas-form-group"><label>Benefits</label><textarea rows={2} value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} /></div>
            <div className="saas-confirm-actions">
              <button type="submit" className="saas-btn saas-btn-primary">{editing ? 'Update' : 'Create'} Job</button>
              <button type="button" className="saas-btn saas-btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="saas-loading">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="saas-empty-state"><Briefcase size={48} strokeWidth={1} /><h3>No jobs yet</h3><p>Create your first job posting.</p></div>
      ) : (
        <div className="saas-jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="saas-card saas-job-card">
              <div className="saas-job-card-header">
                <span className={`saas-job-status ${job.status === 'Open' ? 'open' : 'closed'}`}>{job.status}</span>
                <div className="saas-job-actions">
                  <button type="button" className="saas-icon-btn" onClick={() => handleEdit(job)}><Pencil size={14} /></button>
                  <button type="button" className="saas-icon-btn" onClick={() => handleDelete(job.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              <h3>{job.title}</h3>
              <div className="saas-job-meta">
                {job.location && <span><MapPin size={14} /> {job.location}</span>}
                <span><Briefcase size={14} /> {job.employmentType}</span>
                <span><Users size={14} /> {job._count.applicants} applicants</span>
              </div>
              <div className="saas-job-card-footer">
                <Link href={`/jobs/${job.slug}`} target="_blank" className="saas-link">View apply page</Link>
                <button type="button" className="saas-btn saas-btn-outline saas-btn-sm" onClick={() => toggleStatus(job)}>
                  {job.status === 'Open' ? 'Close Job' : 'Reopen Job'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
