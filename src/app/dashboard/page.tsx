'use client';

import { useAuthStore } from '@/stores/authStore';
import { useMounted } from '@/hooks/use-mounted';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { SubAdminDashboard } from '@/components/dashboard/SubAdminDashboard';
import { AssociationAdminDashboard } from '@/components/dashboard/AssociationAdminDashboard';

export default function DashboardPage() {
  const { admin } = useAuthStore();
  const mounted = useMounted();

  if (!mounted || !admin) return null;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen bg-background/50">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-6 border-b border-border/40 animate-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Overview
        </h1>
        <p className="text-base text-muted-foreground">
          Welcome back, <span className="font-medium text-foreground">{admin.name}</span>.
          Here&apos;s your daily breakdown.
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {admin.role === 'SUPER_ADMIN' && <SuperAdminDashboard />}
      {admin.role === 'SUB_ADMIN' && <SubAdminDashboard />}
      {admin.role === 'ASSOCIATION_ADMIN' && <AssociationAdminDashboard />}
    </div>
  );
}
