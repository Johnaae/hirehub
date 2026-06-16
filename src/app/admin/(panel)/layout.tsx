import AdminLayout from '@/components/admin/AdminLayout';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
