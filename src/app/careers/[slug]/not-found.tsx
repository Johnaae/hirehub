import Link from 'next/link';

export default function CareersNotFound() {
  return (
    <div className="page">
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Company not found</h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
          This careers page does not exist or the company is no longer active.
        </p>
        <Link href="/" className="btn btn-primary">Go to HireHub</Link>
      </div>
    </div>
  );
}
