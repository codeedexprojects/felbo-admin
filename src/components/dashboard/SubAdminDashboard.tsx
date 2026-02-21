import { Store, CalendarCheck2, AlertCircle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSection } from './DashboardSection';
import { StatCard } from './StatCard';

export function SubAdminDashboard() {
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
