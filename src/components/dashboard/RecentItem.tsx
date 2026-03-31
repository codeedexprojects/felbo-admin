export function RecentItem({
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
