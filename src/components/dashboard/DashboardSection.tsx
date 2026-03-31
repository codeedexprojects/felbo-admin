import { cn } from '@/lib/utils';

export function DashboardSection({
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
