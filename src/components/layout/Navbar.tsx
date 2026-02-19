'use client';

import { usePathname } from 'next/navigation';
import { User, LogOut, Settings, Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { MobileSidebar } from './MobileSidebar';
import { useMounted } from '@/hooks/use-mounted';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navbar() {
  const pathname = usePathname();
  const { admin, logout } = useAuthStore();

  const getPageTitle = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    const lastSegment = segments[segments.length - 1];
    if (lastSegment.match(/^[0-9a-fA-F-]{36}$/)) return 'Details';
    return lastSegment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const mounted = useMounted();
  if (!mounted) return null;

  const roleLabel = admin?.role?.replace(/_/g, ' ') || 'GUEST';

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <h1 className="text-sm font-semibold text-foreground hidden md:block tracking-tight">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* Role pill */}
        <span className="hidden md:inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {roleLabel}
        </span>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8 ring-1 ring-border">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${admin?.name}&backgroundColor=0D6868&textColor=ffffff`}
                  alt={admin?.name}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {admin?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{admin?.name}</p>
                <p className="text-xs leading-none text-muted-foreground mt-0.5">{admin?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm">
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="gap-2 text-sm text-red-500 focus:text-red-500 focus:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
