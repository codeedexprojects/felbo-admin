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

export function SuperAdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Metrics Section */}
      <DashboardSection title="Performance Overview">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            index={1}
            title="Total Users"
            value="12,543"
            icon={Users}
            description="All time registered"
            trend="up"
            color="blue"
          />
          <StatCard
            index={2}
            title="Total Vendors"
            value="845"
            icon={Store}
            description="All time registered"
            trend="up"
            color="violet"
          />
          <StatCard
            index={3}
            title="Total Bookings"
            value="45,231"
            icon={CalendarCheck2}
            description="All time bookings"
            trend="up"
            color="emerald"
          />
          <StatCard
            index={4}
            title="Today's Bookings"
            value="142"
            icon={Activity}
            description="Bookings today"
            trend="up"
            color="amber"
          />
          <StatCard
            index={5}
            title="Today's Revenue"
            value="₹1,420"
            icon={IndianRupee}
            description="Sum of ₹10 advances"
            trend="up"
            color="emerald"
          />
          <Link href="/dashboard/vendors/requests" className="block w-full">
            <StatCard
              index={6}
              title="Pending Verifications"
              value="12"
              icon={Clock}
              description="Vendors awaiting approval"
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
            <RecentItem
              index={1}
              initials="JD"
              primary="John Doe"
              secondary="Shop closed down unexpectedly"
              tertiary="PENDING"
            />
            <RecentItem
              index={2}
              initials="AS"
              primary="Alice Smith"
              secondary="Barber unavailable at chosen time"
              tertiary="RESOLVED"
            />
            <RecentItem
              index={3}
              initials="RK"
              primary="Rahul K."
              secondary="App crashed during payment"
              tertiary="INVESTIGATING"
            />
            <RecentItem
              index={4}
              initials="MJ"
              primary="Mary Jane"
              secondary="Long waiting time at shop"
              tertiary="PENDING"
            />
            <RecentItem
              index={5}
              initials="TG"
              primary="Tom Green"
              secondary="Location issue with map display"
              tertiary="RESOLVED"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
