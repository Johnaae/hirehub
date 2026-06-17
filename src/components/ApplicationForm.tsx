'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { POSITIONS, EMPLOYMENT_TYPES, DAYS } from '@/lib/constants';
import { useUploadThing } from '@/lib/uploadthing';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  position: '',
  employmentType: '',
  authorizedToWork: '',
  over18: '',
  customerServiceExperience: '',
  upsPrintShippingExperience: '',
  availableStartDate: '',
  previousEmployer: '',
  previousJobTitle: '',
  previousStartDate: '',
  previousEndDate: '',
  reasonForLeaving: '',
  whyWorkHere: '',
  certified: false,
};

const initialAvailability = DAYS.reduce<Record<string, string>>((acc, day) => {
  acc[day] = '';
  return acc;
}, {});

interface ValidationDetail {
  field: string;
  message: string;
}

function buildPayload(
  form: typeof initialForm,
  availability: Record<string, string>,
  resumeInfo: { filename: string; url: string; key: string } | null,
  jobId?: number,
  companySlug?: string,
  source?: string
) {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    zip: form.zip.trim(),
    position: form.position,
    employmentType: form.employmentType,
    authorizedToWork: form.authorizedToWork === 'yes',
    over18: form.over18 === 'yes',
    customerServiceExperience: form.customerServiceExperience === 'yes',
    upsPrintShippingExperience: form.upsPrintShippingExperience === 'yes',
    availableStartDate: form.availableStartDate,
    whyWorkHere: form.whyWorkHere.trim(),
    certified: true as const,
    availability,
    previousEmployer: form.previousEmployer.trim() || null,
    previousJobTitle: form.previousJobTitle.trim() || null,
    previousStartDate: form.previousStartDate || null,
    previousEndDate: form.previousEndDate || null,
    reasonForLeaving: form.reasonForLeaving.trim() || null,
    resumeFilename: resumeInfo?.filename || null,
    resumeUrl: resumeInfo?.url || null,
    resumeKey: resumeInfo?.key || null,
    ...(jobId ? { jobId } : {}),
    ...(companySlug ? { companySlug } : {}),
    ...(source ? { source } : {}),
  };
}

function mapDetailsToFieldErrors(details: ValidationDetail[]): Record<string, string> {
  const mapped: Record<string, string> = {};
  for (const { field, message } of details) {
    mapped[field] = message;
  }
  return mapped;
}

function formatFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    state: 'State',
    zip: 'ZIP Code',
    position: 'Position',
    employmentType: 'Employment Type',
    availableStartDate: 'Available Start Date',
    authorizedToWork: 'Work Authorization',
    over18: 'Age Confirmation',
    customerServiceExperience: 'Customer Service Experience',
    upsPrintShippingExperience: 'Retail/Shipping Experience',
    whyWorkHere: 'Why Work Here',
    certified: 'Certification',
    previousEmployer: 'Previous Employer',
    previousJobTitle: 'Job Title',
    previousStartDate: 'Previous Start Date',
    previousEndDate: 'Previous End Date',
    reasonForLeaving: 'Reason for Leaving',
    resumeUrl: 'Resume',
    resumeFilename: 'Resume',
  };
  return labels[field] || field;
}

export default function ApplicationForm({
  jobId,
  companySlug,
  applySource,
  defaultPosition = '',
  defaultEmploymentType = '',
}: {
  jobId?: number;
  companySlug?: string;
  applySource?: string;
  defaultPosition?: string;
  defaultEmploymentType?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...initialForm,
    position: defaultPosition,
    employmentType: defaultEmploymentType,
  });
  const [availability, setAvailability] = useState(initialAvailability);
  const [resumeInfo, setResumeInfo] = useState<{
    filename: string;
    url: string;
    key: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitDetails, setSubmitDetails] = useState<ValidationDetail[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { startUpload } = useUploadThing('resumeUploader', {
    onClientUploadComplete: (files) => {
      const file = files[0];
      if (file) {
        const url = ('ufsUrl' in file && file.ufsUrl) ? String(file.ufsUrl) : file.url;
        setResumeInfo({ filename: file.name, url, key: file.key });
        setErrors((prev) => ({ ...prev, resume: '' }));
      }
      setUploading(false);
    },
    onUploadError: (error) => {
      setErrors((prev) => ({ ...prev, resume: error.message }));
      setUploading(false);
    },
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    if (submitError) {
      setSubmitError('');
      setSubmitDetails([]);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.zip.trim()) newErrors.zip = 'ZIP code is required';
    if (!form.position) newErrors.position = 'Please select a position';
    if (!form.employmentType) newErrors.employmentType = 'Please select employment type';
    if (form.authorizedToWork === '') newErrors.authorizedToWork = 'Please answer this question';
    else if (form.authorizedToWork === 'no') newErrors.authorizedToWork = 'You must be authorized to work in the US';
    if (form.over18 === '') newErrors.over18 = 'Please answer this question';
    else if (form.over18 === 'no') newErrors.over18 = 'You must be at least 18 years old';
    if (form.customerServiceExperience === '') newErrors.customerServiceExperience = 'Please answer this question';
    if (form.upsPrintShippingExperience === '') newErrors.upsPrintShippingExperience = 'Please answer this question';
    if (!form.availableStartDate) newErrors.availableStartDate = 'Start date is required';
    if (!form.whyWorkHere.trim()) newErrors.whyWorkHere = 'Please tell us why you want to work here';
    if (!form.certified) newErrors.certified = 'You must certify the information is true';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      setErrors((prev) => ({ ...prev, resume: 'Resume must be PDF, DOC, or DOCX' }));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, resume: 'Resume must be 4MB or smaller' }));
      return;
    }

    setUploading(true);
    setResumeInfo(null);
    await startUpload([file]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitDetails([]);

    if (!validate()) {
      document.querySelector('.field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);

    const payload = buildPayload(form, availability, resumeInfo, jobId, companySlug, applySource);
    console.log('Submitting application payload:', payload);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Application submit failed:', data);
        setSubmitError(data.error || 'Failed to submit application');

        if (Array.isArray(data.details) && data.details.length > 0) {
          setSubmitDetails(data.details);
          setErrors((prev) => ({ ...prev, ...mapDetailsToFieldErrors(data.details) }));
        }

        document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      router.push(companySlug ? `/success?company=${encodeURIComponent(companySlug)}` : '/success');
    } catch (err) {
      console.error('Application submit error:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id="application-form" className="application-form card" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">Job Application</h2>
      <p className="form-subtitle">Fill out the form below to apply. Fields marked with * are required.</p>

      {submitError && (
        <div className="alert alert-error">
          <p>{submitError}</p>
          {submitDetails.length > 0 && (
            <ul className="validation-details">
              {submitDetails.map((d) => (
                <li key={`${d.field}-${d.message}`}>
                  <strong>{formatFieldLabel(d.field)}:</strong> {d.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <fieldset className="form-section">
        <legend>Personal Information</legend>
        <div className="form-row">
          <FormField id="firstName" label="First Name *" value={form.firstName} error={errors.firstName} onChange={(v) => updateField('firstName', v)} />
          <FormField id="lastName" label="Last Name *" value={form.lastName} error={errors.lastName} onChange={(v) => updateField('lastName', v)} />
        </div>
        <div className="form-row">
          <FormField id="email" label="Email *" type="email" value={form.email} error={errors.email} onChange={(v) => updateField('email', v)} />
          <FormField id="phone" label="Phone *" type="tel" value={form.phone} error={errors.phone} onChange={(v) => updateField('phone', v)} />
        </div>
        <FormField id="address" label="Address *" value={form.address} error={errors.address} onChange={(v) => updateField('address', v)} />
        <div className="form-row form-row-3">
          <FormField id="city" label="City *" value={form.city} error={errors.city} onChange={(v) => updateField('city', v)} />
          <FormField id="state" label="State *" value={form.state} error={errors.state} onChange={(v) => updateField('state', v)} />
          <FormField id="zip" label="ZIP Code *" value={form.zip} error={errors.zip} onChange={(v) => updateField('zip', v)} />
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Position Details</legend>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="position">Position Applying For *</label>
            <select id="position" value={form.position} onChange={(e) => updateField('position', e.target.value)} className={errors.position ? 'input-error' : ''}>
              <option value="">Select a position</option>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.position && <span className="field-error">{errors.position}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="employmentType">Employment Type *</label>
            <select id="employmentType" value={form.employmentType} onChange={(e) => updateField('employmentType', e.target.value)} className={errors.employmentType ? 'input-error' : ''}>
              <option value="">Select type</option>
              {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.employmentType && <span className="field-error">{errors.employmentType}</span>}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="availableStartDate">Available Start Date *</label>
          <input id="availableStartDate" type="date" value={form.availableStartDate} onChange={(e) => updateField('availableStartDate', e.target.value)} className={errors.availableStartDate ? 'input-error' : ''} />
          {errors.availableStartDate && <span className="field-error">{errors.availableStartDate}</span>}
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Eligibility & Experience</legend>
        <YesNoField label="Are you legally authorized to work in the United States?" name="authorizedToWork" value={form.authorizedToWork} error={errors.authorizedToWork} onChange={(v) => updateField('authorizedToWork', v)} />
        <YesNoField label="Are you at least 18 years old?" name="over18" value={form.over18} error={errors.over18} onChange={(v) => updateField('over18', v)} />
        <YesNoField label="Previous customer service experience?" name="customerServiceExperience" value={form.customerServiceExperience} error={errors.customerServiceExperience} onChange={(v) => updateField('customerServiceExperience', v)} />
        <YesNoField label="Previous retail, shipping, printing, or customer service experience?" name="upsPrintShippingExperience" value={form.upsPrintShippingExperience} error={errors.upsPrintShippingExperience} onChange={(v) => updateField('upsPrintShippingExperience', v)} />
      </fieldset>

      <fieldset className="form-section">
        <legend>Weekly Availability <span className="optional-tag">(optional)</span></legend>
        <p className="field-hint">Enter your available hours for each day (e.g., 9am–5pm). Leave blank if not available.</p>
        <div className="availability-grid">
          {DAYS.map((day) => (
            <div key={day} className="form-group">
              <label htmlFor={`avail-${day}`}>{day}</label>
              <input id={`avail-${day}`} type="text" placeholder="e.g., 9am–5pm" value={availability[day]} onChange={(e) => setAvailability((prev) => ({ ...prev, [day]: e.target.value }))} />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Work History <span className="optional-tag">(optional)</span></legend>
        <FormField id="previousEmployer" label="Previous Employer" value={form.previousEmployer} error={errors.previousEmployer} onChange={(v) => updateField('previousEmployer', v)} />
        <FormField id="previousJobTitle" label="Job Title" value={form.previousJobTitle} error={errors.previousJobTitle} onChange={(v) => updateField('previousJobTitle', v)} />
        <div className="form-row">
          <FormField id="previousStartDate" label="Start Date" type="date" value={form.previousStartDate} error={errors.previousStartDate} onChange={(v) => updateField('previousStartDate', v)} />
          <FormField id="previousEndDate" label="End Date" type="date" value={form.previousEndDate} error={errors.previousEndDate} onChange={(v) => updateField('previousEndDate', v)} />
        </div>
        <div className="form-group">
          <label htmlFor="reasonForLeaving">Reason for Leaving</label>
          <textarea id="reasonForLeaving" rows={2} value={form.reasonForLeaving} onChange={(e) => updateField('reasonForLeaving', e.target.value)} />
          {errors.reasonForLeaving && <span className="field-error">{errors.reasonForLeaving}</span>}
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Additional Information</legend>
        <div className="form-group">
          <label htmlFor="whyWorkHere">Why do you want to work here? *</label>
          <textarea id="whyWorkHere" rows={4} value={form.whyWorkHere} onChange={(e) => updateField('whyWorkHere', e.target.value)} className={errors.whyWorkHere ? 'input-error' : ''} />
          {errors.whyWorkHere && <span className="field-error">{errors.whyWorkHere}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="resume">Resume (PDF, DOC, or DOCX — max 4MB) <span className="optional-tag">(optional)</span></label>
          <input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} className={errors.resume ? 'input-error' : ''} disabled={uploading} />
          {uploading && <span className="field-hint">Uploading resume...</span>}
          {resumeInfo && <span className="field-hint">Uploaded: {resumeInfo.filename}</span>}
          {errors.resume && <span className="field-error">{errors.resume}</span>}
        </div>
      </fieldset>

      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={form.certified} onChange={(e) => updateField('certified', e.target.checked)} />
          I certify that the information provided is true and complete. *
        </label>
        {errors.certified && <span className="field-error">{errors.certified}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting || uploading}>
        {submitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}

function FormField({ id, label, value, error, onChange, type = 'text' }: {
  id: string; label: string; value: string; error?: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className={error ? 'input-error' : ''} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

function YesNoField({ label, name, value, error, onChange }: {
  label: string; name: string; value: string; error?: string; onChange: (v: string) => void;
}) {
  return (
    <div className="form-group yes-no-group">
      <span className="yes-no-label">{label} *</span>
      <div className="yes-no-options">
        <label className="radio-label">
          <input type="radio" name={name} value="yes" checked={value === 'yes'} onChange={() => onChange('yes')} />
          Yes
        </label>
        <label className="radio-label">
          <input type="radio" name={name} value="no" checked={value === 'no'} onChange={() => onChange('no')} />
          No
        </label>
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
