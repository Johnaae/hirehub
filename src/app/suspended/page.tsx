export default function SuspendedPage() {
  return (
    <div className="page login-page">
      <div className="login-container">
        <div className="login-card card" style={{ textAlign: 'center' }}>
          <h1>Account Suspended</h1>
          <p style={{ color: 'var(--gray-600)', margin: '1rem 0' }}>
            Your company account has been suspended. Please contact support for assistance.
          </p>
          <a href="mailto:support@hirehub.app" className="btn btn-primary">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
