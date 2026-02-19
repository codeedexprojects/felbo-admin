'use client';

import { useAuthStore } from '@/stores/authStore';
import { useMounted } from '@/hooks/use-mounted';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Store,
  CalendarCheck2,
  IndianRupee,
  Activity,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
  Wallet,
} from 'lucide-react';
import { AdminRole } from '@/types/api';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

// --- Styled Components (Enhanced with color & animation) ---

function DashboardSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out',
        className
      )}
    >
      {title && (
        <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest pl-1">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue',
  index = 0, // for staggered animation
}: {
  title: string;
  value: string;
  icon?: React.ElementType;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose';
  index?: number;
}) {
  const colorStyles = useMemo(() => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'violet':
        return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
      case 'rose':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  }, [color]);

  return (
    <div
      className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-border/60"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Background Gradient Effect */}
      <div
        className={cn(
          'absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20',
          colorStyles.split(' ')[0].replace('/10', '')
        )}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition-colors',
            colorStyles
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </span>
      </div>
      {(description || trend) && (
        <div className="mt-2 flex items-center gap-2">
          {trend === 'up' && (
            <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +12.5%
            </span>
          )}
          <p className="text-xs text-muted-foreground/80">{description}</p>
        </div>
      )}
    </div>
  );
}

// Reuseable Recent List Item
function RecentItem({
  initials,
  primary,
  secondary,
  tertiary,
  index = 0,
}: {
  initials: string;
  primary: string;
  secondary: string;
  tertiary: string;
  index?: number;
}) {
  return (
    <div
      className="flex items-center justify-between py-3 px-3 -mx-2 rounded-lg group cursor-default transition-all duration-200 hover:bg-muted/50 border border-transparent hover:border-border/40"
      style={{
        animation: `fadeIn 0.5s ease-out forwards ${index * 100}ms`,
        opacity: 0,
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold text-primary ring-2 ring-background shadow-sm group-hover:scale-105 transition-transform">
          {initials}
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {primary}
          </p>
          <p className="text-xs text-muted-foreground">{secondary}</p>
        </div>
      </div>
      <div className="text-sm font-bold font-mono text-muted-foreground group-hover:text-emerald-500 transition-colors tabular-nums bg-muted/30 px-2 py-1 rounded-md group-hover:bg-emerald-500/10">
        {tertiary}
      </div>
    </div>
  );
}

// --- Views ---

function SuperAdminDashboard() {
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
              {/* Decorative Placeholder for Chart */}
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

function SubAdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DashboardSection title="Operations Center">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            index={1}
            title="Active Vendors"
            value="2,350"
            icon={Store}
            description="Verified partners"
            color="violet"
          />
          <StatCard
            index={2}
            title="Monthly Bookings"
            value="12,234"
            icon={CalendarCheck2}
            description="Total processed"
            color="blue"
          />
          <StatCard
            index={3}
            title="Pending Issues"
            value="23"
            icon={AlertCircle}
            description="Requires attention"
            color="rose"
          />
        </div>
      </DashboardSection>

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
    </div>
  );
}

function AssociationAdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DashboardSection title="Association Overview">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            index={1}
            title="My Vendors"
            value="124"
            icon={Users}
            description="Registered members"
            color="blue"
          />
          <StatCard
            index={2}
            title="Share Pending"
            value="₹12,400"
            icon={TrendingUp}
            description="Revenue share"
            color="emerald"
          />
          <StatCard
            index={3}
            title="Member Bookings"
            value="843"
            icon={CalendarCheck2}
            description="This month"
            color="amber"
          />
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

export default function DashboardPage() {
  const { admin } = useAuthStore();
  const mounted = useMounted();

  if (!mounted || !admin) return null;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen bg-background/50">
      {/* Detailed Header similar to Vercel/Linear overview headers */}
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
