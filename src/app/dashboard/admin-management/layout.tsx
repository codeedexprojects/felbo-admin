import { RoleGuard } from '@/components/layout/RoleGuard';

export default function AdminManagementLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['SUPER_ADMIN']}>{children}</RoleGuard>;
}
