import { IndianRupee, Store, CalendarCheck2, Activity, MoreHorizontal, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSection } from './DashboardSection';
import { StatCard } from './StatCard';
import { RecentItem } from './RecentItem';

export function SuperAdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Metrics Section */}
      <DashboardSection title="Performance Overview">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            index={1}
            title="Total Revenue"
            value="₹45,231"
            icon={IndianRupee}
            description="Total earnings"
            trend="up"
            color="emerald"
          />
          <StatCard
            index={2}
            title="Active Vendors"
            value="2,350"
            icon={Store}
            description="+180 this month"
            trend="up"
            color="violet"
          />
          <StatCard
            index={3}
            title="Total Bookings"
            value="12,234"
            icon={CalendarCheck2}
            description="+19% vs last month"
            trend="up"
            color="blue"
          />
          <StatCard
            index={4}
            title="Active Users"
            value="892"
            icon={Activity}
            description="Currently online"
            color="amber"
          />
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

        {/* Recent Transactions List */}
        <Card className="col-span-3 shadow-sm border-border/60 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
              <div className="p-1.5 rounded-full bg-primary/10">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-6">
            <RecentItem
              index={1}
              initials="JD"
              primary="John Doe"
              secondary="booking@felbo.com"
              tertiary="+₹120.00"
            />
            <RecentItem
              index={2}
              initials="AS"
              primary="Alice Smith"
              secondary="vendor_reg@gmail.com"
              tertiary="+₹499.00"
            />
            <RecentItem
              index={3}
              initials="RK"
              primary="Rahul K."
              secondary="booking@yahoo.com"
              tertiary="+₹120.00"
            />
            <RecentItem
              index={4}
              initials="MJ"
              primary="Mary Jane"
              secondary="service@outlook.com"
              tertiary="+₹350.00"
            />
            <RecentItem
              index={5}
              initials="TG"
              primary="Tom Green"
              secondary="tommy@gmail.com"
              tertiary="+₹120.00"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
