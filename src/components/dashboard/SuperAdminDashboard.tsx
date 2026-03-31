import {
  IndianRupee,
  Store,
  CalendarCheck2,
  Activity,
  MoreHorizontal,
  Users,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSection } from './DashboardSection';
import { StatCard } from './StatCard';
import { RecentItem } from './RecentItem';
import Link from 'next/link';
import { useSuperAdminDashboard } from '@/features/dashboard/hooks';
import { Skeleton } from '@/components/ui/skeleton';

export function SuperAdminDashboard() {
  const { data, isLoading, isError, error } = useSuperAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <DashboardSection title="Performance Overview">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
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
        <h3 className="text-lg font-semibold">Failed to load dashboard data</h3>
        <p className="text-sm opacity-80">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Metrics Section */}
      <DashboardSection title="Performance Overview">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            index={1}
            title="Total Users"
            value={data?.totalUsers.toLocaleString() ?? '0'}
            icon={Users}
            color="blue"
          />
          <StatCard
            index={2}
            title="Total Vendors"
            value={data?.totalVendors.toLocaleString() ?? '0'}
            icon={Store}
            color="violet"
          />
          <StatCard
            index={3}
            title="Total Bookings"
            value={data?.totalBookings.toLocaleString() ?? '0'}
            icon={CalendarCheck2}
            color="emerald"
          />
          <StatCard
            index={4}
            title="Today's Bookings"
            value={data?.todaysBookings.toLocaleString() ?? '0'}
            icon={Activity}
            color="amber"
          />
          <StatCard
            index={5}
            title="Today's Revenue"
            value={`₹${(data?.todaysRevenue ?? 0).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={IndianRupee}
            color="emerald"
          />
          <Link href="/dashboard/vendors/requests" className="block w-full">
            <StatCard
              index={6}
              title="Pending Verifications"
              value={data?.pendingVerifications.toLocaleString() ?? '0'}
              icon={Clock}
              color="rose"
            />
          </Link>
        </div>
      </DashboardSection>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
        {/* Overview Chart Area */}
        <Card className="col-span-4 shadow-sm border-border/60 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
              <p className="text-xs text-muted-foreground">Monthly revenue performance</p>
            </div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          </CardHeader>
          <CardContent className="pl-0 pt-6">
            <div className="h-[300px] w-full flex items-center justify-center m-4 mt-0 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent rounded-b-md" />
              <div className="flex flex-col items-center gap-2 z-10">
                <Activity className="h-10 w-10 text-primary/20 animate-pulse" />
                <span className="text-sm text-muted-foreground font-medium">
                  Chart Visualization Loading...
                </span>
              </div>
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
                <RecentItem
                  key={issue.id}
                  index={i}
                  initials={issue.userName.substring(0, 2).toUpperCase()}
                  primary={issue.userName}
                  secondary={issue.reason}
                  tertiary={issue.status}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
