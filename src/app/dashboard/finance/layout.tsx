import { RoleGuard } from '@/components/layout/RoleGuard';

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['SUPER_ADMIN', 'ASSOCIATION_ADMIN']}>{children}</RoleGuard>;
}
