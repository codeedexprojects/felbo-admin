import {
  LayoutDashboard,
  Users,
  Store,
  CalendarCheck2,
  AlertOctagon,
  CreditCard,
  Ban,
  Settings,
  Building2,
  Megaphone,
  Banknote,
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
    roles: ['SUPER_ADMIN', 'SUB_ADMIN'],
  },
  {
    title: 'My Vendors',
    href: '/dashboard/association',
    icon: Building2,
    roles: ['ASSOCIATION_ADMIN'],
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
    roles: ['SUPER_ADMIN', 'SUB_ADMIN'],
  },
  {
    title: 'Advertisements',
    href: '/dashboard/advertisements',
    icon: Megaphone,
    roles: ['SUPER_ADMIN', 'SUB_ADMIN'],
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
    roles: ['SUPER_ADMIN', 'SUB_ADMIN'],
  },
  {
    title: 'Finance',
    href: '/dashboard/finance/revenue',
    icon: CreditCard,
    roles: ['SUPER_ADMIN', 'ASSOCIATION_ADMIN'],
  },
  {
    title: 'Payouts',
    href: '/dashboard/finance/payouts',
    icon: Banknote,
    roles: ['SUPER_ADMIN', 'ASSOCIATION_ADMIN'],
  },
  {
    title: 'Cancellations',
    href: '/dashboard/cancellation-management',
    icon: Ban,
    roles: ['SUPER_ADMIN', 'SUB_ADMIN'],
  },
  {
    title: 'System Config',
    href: '/dashboard/system-config',
    icon: Settings,
    roles: ['SUPER_ADMIN'],
  },
];
