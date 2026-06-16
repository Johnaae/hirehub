const STATUS_CLASSES: Record<string, string> = {
  New: 'badge-new',
  Reviewing: 'badge-reviewing',
  Interview: 'badge-interview',
  Hired: 'badge-hired',
  Rejected: 'badge-rejected',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STATUS_CLASSES[status] || 'badge-default'}`}>
      {status}
    </span>
  );
}
