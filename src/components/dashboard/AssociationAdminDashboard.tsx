import { Users, TrendingUp, CalendarCheck2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSection } from './DashboardSection';
import { StatCard } from './StatCard';

export function AssociationAdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DashboardSection title="Association Overview">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            index={1}
            title="Vendors"
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
