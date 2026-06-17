'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import SearchableSelect from './SearchableSelect';
import MultiSearchableSelect from './MultiSearchableSelect';
import { arrayToLines, linesToArray, JOB_STATUSES, type JobStatus } from '@/lib/jobs';

export interface JobTemplate {
  id: number;
  name: string;
  title: string;
  department: string | null;
  employmentType: string;
  salaryRange: string | null;
  locationType: string | null;
  description: string;
  requirements: string | null;
  benefits: string | null;
  isSystemTemplate: boolean;
}

export interface JobLookups {
  department: string[];
  job_title: string[];
  employment_type: string[];
  salary_range: string[];
  location: string[];
  requirement: string[];
  benefit: string[];
}

export interface JobFormValues {
  title: string;
  department: string;
  employmentType: string;
  salary: string;
  location: string;
  description: string;
  requirements: string[];
  benefits: string[];
  status: JobStatus;
}

const EMPTY_FORM: JobFormValues = {
  title: '',
  department: '',
  employmentType: 'Full-Time',
  salary: '',
  location: 'On-site',
  description: '',
  requirements: [],
  benefits: [],
  status: 'Open',
};

interface JobFormPanelProps {
  editingId: number | null;
  initialValues?: Partial<JobFormValues>;
  lookups: JobLookups;
  templates: JobTemplate[];
  onClose: () => void;
  onSaved: () => void;
  onLookupsChange: (lookups: JobLookups) => void;
  onTemplatesChange: (templates: JobTemplate[]) => void;
}

export default function JobFormPanel({
  editingId,
  initialValues,
  lookups,
  templates,
  onClose,
  onSaved,
  onLookupsChange,
  onTemplatesChange,
}: JobFormPanelProps) {
  const [form, setForm] = useState<JobFormValues>({ ...EMPTY_FORM, ...initialValues });
  const [selectedTemplate, setSelectedTemplate] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    setForm({ ...EMPTY_FORM, ...initialValues });
    setSelectedTemplate('');
  }, [editingId, initialValues]);

  const applyTemplate = (templateId: number) => {
    const t = templates.find((x) => x.id === templateId);
    if (!t) return;
    setSelectedTemplate(templateId);
    setForm({
      title: t.title,
      department: t.department || '',
      employmentType: t.employmentType,
      salary: t.salaryRange || '',
      location: t.locationType || 'On-site',
      description: t.description,
      requirements: linesToArray(t.requirements),
      benefits: linesToArray(t.benefits),
      status: form.status,
    });
    toast.success(`Template "${t.name}" applied`);
  };

  const addLookup = async (category: keyof JobLookups, value: string) => {
    const apiCategory = category === 'job_title' ? 'job_title' : category;
    const res = await fetch('/api/admin/jobs/lookups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: apiCategory, value }),
    });
    if (res.ok) {
      onLookupsChange({
        ...lookups,
        [category]: lookups[category].includes(value) ? lookups[category] : [...lookups[category], value],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      department: form.department || null,
      employmentType: form.employmentType,
      salary: form.salary || null,
      location: form.location || null,
      description: form.description,
      requirements: arrayToLines(form.requirements) || null,
      benefits: arrayToLines(form.benefits) || null,
      status: form.status,
    };

    const url = editingId ? `/api/admin/jobs/${editingId}` : '/api/admin/jobs';
    const method = editingId ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    setSaving(false);
    if (res.ok) {
      toast.success(editingId ? 'Job updated' : 'Job created');
      onSaved();
      onClose();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || 'Failed to save job');
    }
  };

  const saveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Enter a template name');
      return;
    }
    const res = await fetch('/api/admin/jobs/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: templateName.trim(),
        title: form.title,
        department: form.department || null,
        employmentType: form.employmentType,
        salaryRange: form.salary || null,
        locationType: form.location || null,
        description: form.description,
        requirements: arrayToLines(form.requirements) || null,
        benefits: arrayToLines(form.benefits) || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      onTemplatesChange([...templates, data.template]);
      toast.success('Custom template saved');
      setShowSaveTemplate(false);
      setTemplateName('');
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || 'Failed to save template');
    }
  };

  return (
    <div className="ats-form-overlay">
      <div className="ats-form-panel">
        <div className="ats-form-header">
          <div>
            <h2>{editingId ? 'Edit Job Posting' : 'Create Job Posting'}</h2>
            <p>All fields are editable before saving</p>
          </div>
          <button type="button" className="ats-icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ats-form-body">
          {!editingId && templates.length > 0 && (
            <section className="ats-template-section">
              <div className="ats-template-header">
                <Sparkles size={16} />
                <span>Start from a template</span>
              </div>
              <div className="ats-template-grid">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`ats-template-card ${selectedTemplate === t.id ? 'selected' : ''}`}
                    onClick={() => applyTemplate(t.id)}
                  >
                    <FileText size={18} />
                    <span className="ats-template-name">{t.name}</span>
                    {t.isSystemTemplate && <span className="ats-template-badge">System</span>}
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="ats-form-section">
            <h3>Position Details</h3>
            <div className="ats-form-grid">
              <SearchableSelect
                label="Job Title"
                required
                options={lookups.job_title}
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                allowCustom
                onAddCustom={(v) => addLookup('job_title', v)}
              />
              <SearchableSelect
                label="Department"
                options={lookups.department}
                value={form.department}
                onChange={(v) => setForm({ ...form, department: v })}
                allowCustom
                onAddCustom={(v) => addLookup('department', v)}
              />
              <SearchableSelect
                label="Employment Type"
                required
                options={lookups.employment_type}
                value={form.employmentType}
                onChange={(v) => setForm({ ...form, employmentType: v })}
              />
              <SearchableSelect
                label="Salary Range"
                options={lookups.salary_range}
                value={form.salary}
                onChange={(v) => setForm({ ...form, salary: v })}
                allowCustom
                onAddCustom={(v) => addLookup('salary_range', v)}
              />
              <SearchableSelect
                label="Location"
                options={lookups.location}
                value={form.location}
                onChange={(v) => setForm({ ...form, location: v })}
                allowCustom
                onAddCustom={(v) => addLookup('location', v)}
              />
              <div className="ats-field">
                <label className="ats-label">Status</label>
                <select
                  className="ats-native-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as JobStatus })}
                >
                  {JOB_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="ats-form-section">
            <h3>Job Description</h3>
            <div className="ats-field">
              <textarea
                className="ats-textarea"
                required
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
              />
            </div>
          </div>

          <div className="ats-form-section">
            <h3>Requirements & Benefits</h3>
            <MultiSearchableSelect
              label="Requirements"
              options={lookups.requirement}
              selected={form.requirements}
              onChange={(items) => setForm({ ...form, requirements: items })}
              onAddCustom={(v) => addLookup('requirement', v)}
            />
            <MultiSearchableSelect
              label="Benefits"
              options={lookups.benefit}
              selected={form.benefits}
              onChange={(items) => setForm({ ...form, benefits: items })}
              onAddCustom={(v) => addLookup('benefit', v)}
            />
          </div>

          <div className="ats-form-footer">
            <button type="button" className="saas-btn saas-btn-ghost" onClick={() => setShowSaveTemplate(!showSaveTemplate)}>
              <Save size={16} /> Save as Template
            </button>
            <div className="ats-form-footer-right">
              <button type="button" className="saas-btn saas-btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="saas-btn saas-btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </div>

          {showSaveTemplate && (
            <div className="ats-save-template-bar">
              <input
                type="text"
                placeholder="Template name..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <button type="button" className="saas-btn saas-btn-primary saas-btn-sm" onClick={saveAsTemplate}>
                Save Template
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
