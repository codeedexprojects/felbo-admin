import { Store, CalendarCheck2, Activity, Users, Clock, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSection } from './DashboardSection';
import { StatCard } from './StatCard';
import { RecentItem } from './RecentItem';
import Link from 'next/link';

export function SubAdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DashboardSection title="Operations Center">
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
          <Link href="/dashboard/vendors/requests" className="block w-full">
            <StatCard
              index={5}
              title="Pending Verifications"
              value="12"
              icon={Clock}
              description="Vendors awaiting approval"
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
