import { RoleGuard } from '@/components/layout/RoleGuard';

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>{children}</RoleGuard>;
}
