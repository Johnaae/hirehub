export default function LoadingSpinner({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return <div className={`spinner spinner-${size}`} aria-label="Loading" />;
}
