import { Users, TrendingUp, CalendarCheck2, ShieldAlert, Store, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSection } from './DashboardSection';
import { StatCard } from './StatCard';
import { useAssociationAdminDashboard, useTopAssociationVendors } from '@/features/dashboard/hooks';
import { Skeleton } from '@/components/ui/skeleton';

export function AssociationAdminDashboard() {
  const { data, isLoading, isError, error } = useAssociationAdminDashboard();
  const { data: topVendors, isLoading: isTopLoading } = useTopAssociationVendors();

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
          <StatCard
            index={1}
            title="Vendors"
            value={data?.myVendorsCount.toLocaleString() ?? '0'}
            icon={Users}
            color="blue"
          />
          <StatCard
            index={2}
            title="Share Pending"
            value={`₹${(data?.myVendorsRevenue ?? 0).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={TrendingUp}
            color="emerald"
          />
          <StatCard
            index={3}
            title="Member Bookings"
            value={data?.myVendorsBookings.total.toLocaleString() ?? '0'}
            icon={CalendarCheck2}
            color="amber"
          />
        </div>
      </DashboardSection>

      <Card className="shadow-sm border-border/60 bg-card/80">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Top Performing Members</CardTitle>
            <div className="p-1.5 rounded-full bg-amber-500/10">
              <Trophy className="h-4 w-4 text-amber-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-0">
          {isTopLoading ? (
            <div className="px-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : !topVendors || topVendors.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Users className="h-8 w-8 opacity-30" />
              <p className="text-sm">No booking data yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {topVendors.map((vendor, index) => (
                <div
                  key={vendor.vendorId}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <span className="w-5 text-xs font-bold text-muted-foreground shrink-0 text-center">
                    {index + 1}
                  </span>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground overflow-hidden">
                    {vendor.vendorProfilePhoto ? (
                      <img
                        src={vendor.vendorProfilePhoto}
                        alt={vendor.vendorName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      vendor.vendorName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {vendor.vendorName}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Store className="h-3 w-3 shrink-0" />
                      <span className="truncate">{vendor.shopName}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-foreground">{vendor.totalBookings}</p>
                    <p className="text-[11px] text-muted-foreground">bookings</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
