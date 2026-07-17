import { Users, TrendingUp, CalendarCheck2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSection } from './DashboardSection';
import { StatCard } from './StatCard';
import Link from 'next/link';
import { useAssociationAdminDashboard } from '@/features/dashboard/hooks';
import { Skeleton } from '@/components/ui/skeleton';

export function AssociationAdminDashboard() {
  const { data, isLoading, isError, error } = useAssociationAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <DashboardSection title="Association Overview">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </DashboardSection>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-500">
        <ShieldAlert className="h-10 w-10 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Failed to load association dashboard</h3>
        <p className="text-sm opacity-80">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DashboardSection title="Association Overview">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/dashboard/association" className="block w-full">
            <StatCard
              index={1}
              title="Vendors"
              value={data?.myVendorsCount.toLocaleString() ?? '0'}
              icon={Users}
              description="Registered members"
              color="blue"
            />
          </Link>
          <Link href="/dashboard/finance/revenue" className="block w-full">
            <StatCard
              index={2}
              title="Share Pending"
              value={`₹${(data?.myVendorsRevenue ?? 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              icon={TrendingUp}
              description="Revenue share"
              color="emerald"
            />
          </Link>
          <Link href="/dashboard/bookings" className="block w-full">
            <StatCard
              index={3}
              title="Member Bookings"
              value={data?.myVendorsBookings.total.toLocaleString() ?? '0'}
              icon={CalendarCheck2}
              description="Total bookings"
              color="amber"
            />
          </Link>
        </div>
      </DashboardSection>

      <Card className="shadow-sm border-border/60 bg-card/80">
        <CardHeader className="border-b border-border/40">
          <CardTitle className="text-base font-semibold">Member List</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[250px] flex items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/10 text-muted-foreground">
            Vendor list table placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
