'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminRole } from '@/types/api';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: AdminRole[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { isAuthenticated, admin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (allowedRoles && admin && !allowedRoles.includes(admin.role)) {
      // Not allowed
      router.push('/dashboard'); // Simply redirect or show error
    }
  }, [isAuthenticated, admin, allowedRoles, router]);

  if (!isAuthenticated) {
    return null; // Don't render while redirecting
  }

  if (allowedRoles && admin && !allowedRoles.includes(admin.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        You do not have permission to view this page.
      </div>
    );
  }

  return <>{children}</>;
};
