import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-border/40 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stat cards */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart + list grid */}
      <div className="grid gap-6 md:grid-cols-7">
        <div className="col-span-4 rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40">
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="p-6">
            <Skeleton className="h-[260px] w-full rounded-md" />
          </div>
        </div>
        <div className="col-span-3 rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40">
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
