'use client';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebarStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { navItems } from '@/config/nav';
import { useMounted } from '@/hooks/use-mounted';

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();
  const { admin } = useAuthStore();
  const mounted = useMounted();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return admin && item.roles.includes(admin.role);
  });

  if (!mounted) return null;

  return (
    <aside
      className={cn(
        'relative hidden h-screen flex-col border-r border-border/60 bg-background transition-[width] duration-300 ease-in-out md:flex',
        isOpen ? 'w-60' : 'w-14'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-14 items-center border-b border-border/60 px-4 overflow-hidden whitespace-nowrap',
          !isOpen && 'justify-center px-0'
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
            F
          </div>
          {isOpen && (
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Felbo Admin
            </span>
          )}
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3">
        <nav className="grid gap-0.5 px-2">
          <TooltipProvider delayDuration={0}>
            {filteredNavItems.map((item, index) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname?.startsWith(item.href + '/');

              if (!isOpen) {
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-md transition-colors mx-auto',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="sr-only">{item.title}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground font-normal'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </TooltipProvider>
        </nav>
      </div>

      {/* User section */}
      <div className="border-t border-border/60 p-2">
        {isOpen ? (
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-medium text-foreground">
                {admin?.name || 'Admin'}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {admin?.role || 'Role'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {admin?.name?.charAt(0) || 'A'}
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <div className="absolute -right-3 top-[52px] z-20">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full border border-border/60 bg-background shadow-sm hover:bg-muted"
          onClick={toggle}
        >
          {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
      </div>
    </aside>
  );
}
