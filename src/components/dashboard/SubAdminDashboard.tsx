import { Store, CalendarCheck2, Activity, Users, Clock, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSection } from './DashboardSection';
import { StatCard } from './StatCard';
import { RecentItem } from './RecentItem';
import Link from 'next/link';
import { useSuperAdminDashboard } from '@/features/dashboard/hooks';
import { Skeleton } from '@/components/ui/skeleton';

export function SubAdminDashboard() {
  const { data, isLoading, isError, error } = useSuperAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <DashboardSection title="Operations Center">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </DashboardSection>
        <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-[400px] rounded-xl" />
          <Skeleton className="col-span-3 h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-500">
        <ShieldAlert className="h-10 w-10 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Failed to load operations data</h3>
        <p className="text-sm opacity-80">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DashboardSection title="Operations Center">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/users" className="block w-full">
            <StatCard
              index={1}
              title="Total Users"
              value={data?.totalUsers.toLocaleString() ?? '0'}
              icon={Users}
              description="All time registered"
              trend="up"
              color="blue"
            />
          </Link>
          <Link href="/dashboard/vendors" className="block w-full">
            <StatCard
              index={2}
              title="Total Vendors"
              value={data?.totalVendors.toLocaleString() ?? '0'}
              icon={Store}
              description="All time registered"
              trend="up"
              color="violet"
            />
          </Link>
          <Link href="/dashboard/bookings" className="block w-full">
            <StatCard
              index={3}
              title="Total Bookings"
              value={data?.totalBookings.toLocaleString() ?? '0'}
              icon={CalendarCheck2}
              description="All time bookings"
              trend="up"
              color="emerald"
            />
          </Link>
          <Link href="/dashboard/bookings" className="block w-full">
            <StatCard
              index={4}
              title="Today's Bookings"
              value={data?.todaysBookings.toLocaleString() ?? '0'}
              icon={Activity}
              description="Bookings today"
              trend="up"
              color="amber"
            />
          </Link>
          <Link href="/dashboard/vendors/requests" className="block w-full">
            <StatCard
              index={5}
              title="Pending Verifications"
              value={data?.pendingVerifications.toLocaleString() ?? '0'}
              icon={Clock}
              color="rose"
            />
          </Link>
        </div>
      </DashboardSection>

      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-border/60 bg-card/80">
          <CardHeader className="border-b border-border/40">
            <CardTitle className="text-base font-semibold">Operational Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 bg-muted/10 text-muted-foreground relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
              <Activity className="h-8 w-8 opacity-50 mb-2" />
              <span className="text-sm font-medium">Real-time activity feed</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Issues List */}
        <Card className="col-span-3 shadow-sm border-border/60 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Issues</CardTitle>
              <div className="p-1.5 rounded-full bg-rose-500/10">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-6">
            {data?.recentIssues.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent issues</p>
            ) : (
              data?.recentIssues.map((issue, i) => (
                <Link key={issue.id} href={`/dashboard/issues/${issue.id}`} className="block">
                  <RecentItem
                    index={i}
                    initials={issue.userName.substring(0, 2).toUpperCase()}
                    primary={issue.userName}
                    secondary={issue.reason}
                    tertiary={issue.status}
                  />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
