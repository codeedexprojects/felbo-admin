'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { usePageTitleStore } from '@/stores/uiStore';
import { MobileSidebar } from './MobileSidebar';
import { useMounted } from '@/hooks/use-mounted';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function Navbar() {
  const pathname = usePathname();
  const { admin, logout } = useAuthStore();
  const pageTitle = usePageTitleStore((s) => s.pageTitle);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const getPageTitle = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    const lastSegment = segments[segments.length - 1];
    // MongoDB ObjectId (24 hex) or UUID (36 chars with dashes)
    if (lastSegment.match(/^[0-9a-fA-F]{24}$/) || lastSegment.match(/^[0-9a-fA-F-]{36}$/))
      return 'Details';
    return lastSegment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const title = pageTitle || getPageTitle(pathname);

  const mounted = useMounted();
  if (!mounted) return null;

  const roleLabel = admin?.role?.replace(/_/g, ' ') || 'GUEST';

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-sm px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <h1 className="text-sm font-semibold text-foreground hidden md:block tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Role pill */}
        <span className="hidden md:inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {roleLabel}
        </span>

        {/* Avatar — static display */}
        <Avatar className="h-8 w-8 ring-1 ring-border">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${admin?.name}&backgroundColor=0D6868&textColor=ffffff`}
            alt={admin?.name}
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {admin?.name?.charAt(0) || 'A'}
          </AvatarFallback>
        </Avatar>

        {/* Logout — Confirmation Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be signed out of your account. You&apos;ll need to enter your credentials
                again to access the admin dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => logout()}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Log Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
