import {
  LayoutDashboard,
  Users,
  Store,
  CalendarCheck2,
  AlertOctagon,
  CreditCard,
  Ban,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { AdminRole } from '@/types/api';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: AdminRole[];
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Vendors',
    href: '/dashboard/vendors',
    icon: Store,
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Bookings',
    href: '/dashboard/bookings',
    icon: CalendarCheck2,
  },
  {
    title: 'Issues',
    href: '/dashboard/issues',
    icon: AlertOctagon,
  },
  {
    title: 'Finance',
    href: '/dashboard/finance',
    icon: CreditCard,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Cancellations',
    href: '/dashboard/cancellation-management',
    icon: Ban,
  },
  {
    title: 'System Config',
    href: '/dashboard/system-config',
    icon: Settings,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Admins',
    href: '/dashboard/admin-management',
    icon: ShieldCheck,
    roles: ['SUPER_ADMIN'],
  },
];
