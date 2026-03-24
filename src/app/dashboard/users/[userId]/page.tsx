'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  User as UserIcon,
  CreditCard,
  Ban,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Heart,
  History,
  Building2,
  Star,
  Coins,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useUserById } from '@/features/users/hooks';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';
import { BookingListItem } from '@/features/bookings/types';
import { CoinActionModal, CoinActionType } from '@/features/felbocoin/components/CoinActionModal';
import { useQueryClient } from '@tanstack/react-query';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 w-32">{label}</span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
      </div>
      <div className="px-4 py-1 flex-1">{children}</div>
    </div>
  );
}

function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/60 p-4 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex justify-between border-b border-border/30 pb-3 h-8">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border/60 p-4 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

export default function UserDetailPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const { data: user, isLoading, isError } = useUserById(userId);
  const queryClient = useQueryClient();
  useSetPageTitle(user?.name);

  const [coinModalType, setCoinModalType] = useState<CoinActionType | null>(null);

  const handleCoinSuccess = () => {
    toast.success(
      coinModalType === 'credit' ? 'Coins credited successfully' : 'Coins debited successfully'
    );
    queryClient.invalidateQueries({ queryKey: ['users', userId] });
  };

  if (isLoading) return <UserDetailSkeleton />;

  if (isError || !user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Users
          </Link>
        </Button>
        <div className="rounded-xl border border-border/60 bg-card p-8 text-center text-muted-foreground">
          <p className="text-sm">User not found or failed to load.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back and Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/dashboard/users">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Users
            </Link>
          </Button>

          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-border/60">
              <AvatarImage src={user.profileUrl || ''} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
                <Badge
                  variant={
                    user.status === 'ACTIVE'
                      ? 'default'
                      : user.status === 'BLOCKED'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className={cn(
                    'shadow-none border-none py-0.5',
                    user.status === 'ACTIVE' && 'bg-emerald-100 text-emerald-800',
                    user.status === 'BLOCKED' && 'bg-red-100 text-red-800'
                  )}
                >
                  {user.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">ID: {user.id}</p>
            </div>
          </div>
        </div>
      </div>

      {user.status === 'BLOCKED' && user.blockReason && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex gap-3">
          <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-red-900">User is Blocked</h4>
            <p className="text-sm text-red-700 leading-relaxed">{user.blockReason}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Profile Info */}
        <Card title="Profile Information" icon={UserIcon}>
          <InfoRow label="Full Name" value={user.name} />
          <InfoRow label="Phone" value={<span className="font-mono text-sm">{user.phone}</span>} />
          {user.email && (
            <InfoRow label="Email" value={<span className="text-sm">{user.email}</span>} />
          )}
          <InfoRow
            label="Registered On"
            value={format(new Date(user.registeredAt), 'dd MMM yyyy, hh:mm a')}
          />
          <InfoRow
            label="Last Login"
            value={
              user.lastLoginAt ? (
                format(new Date(user.lastLoginAt), 'dd MMM yyyy, hh:mm a')
              ) : (
                <span className="text-muted-foreground italic">Never logged in</span>
              )
            }
          />
        </Card>

        {/* Account Details */}
        <Card title="Account Activity" icon={CreditCard}>
          <InfoRow
            label="Felbo Coins"
            value={
              <span className="font-mono text-sm font-semibold text-emerald-600">
                {user.felboCoinBalance.toFixed(2)}
              </span>
            }
          />
          <InfoRow
            label="Cancellations"
            value={
              <span className="inline-flex items-center gap-1.5 font-mono text-sm">
                <Ban className="h-3.5 w-3.5 text-muted-foreground" />
                {user.cancellationCount}
              </span>
            }
          />
          <InfoRow
            label="Issues Reported"
            value={
              <span className="inline-flex items-center gap-1.5 font-mono text-sm">
                <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                {user.issueCount}
              </span>
            }
          />
        </Card>
      </div>

      {/* FelboCoin Management */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
          <Coins className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-medium text-foreground">FelboCoin Balance</h3>
        </div>
        <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Coins className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold font-mono text-foreground tabular-nums">
                {user.felboCoinBalance.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground">FelboCoins</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
              onClick={() => setCoinModalType('credit')}
            >
              <PlusCircle className="h-4 w-4" />
              Credit Coins
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300"
              onClick={() => setCoinModalType('debit')}
            >
              <MinusCircle className="h-4 w-4" />
              Debit Coins
            </Button>
          </div>
        </div>
      </div>

      {/* Reported Issues Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={`Reported Issues (${user.issueCount})`} icon={AlertTriangle}>
          {user.issuesReported.length > 0 ? (
            <div className="py-2 space-y-3">
              {user.issuesReported.map((issue) => (
                <div
                  key={issue.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/50 p-3 bg-muted/10 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-background">
                        {issue.type.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] uppercase border-transparent',
                        issue.status === 'OPEN' && 'bg-amber-100 text-amber-800',
                        issue.status === 'RESOLVED' && 'bg-emerald-100 text-emerald-800',
                        issue.status === 'REJECTED' && 'bg-red-100 text-red-800'
                      )}
                    >
                      {issue.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{issue.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(issue.createdAt), 'MMM dd, yyyy')}
                    </span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-[11px]" asChild>
                      <Link href={`/dashboard/issues/${issue.id}`}>View Issue</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              This user has not reported any issues.
            </div>
          )}
        </Card>

        {/* Favorite Shops */}
        <Card title={`Favorite Shops (${user.favorites.length})`} icon={Heart}>
          {user.favorites.length > 0 ? (
            <div className="py-2 space-y-3">
              {user.favorites.map((fav) => (
                <div
                  key={fav.shopId}
                  className="flex items-center gap-3 rounded-lg border border-border/50 p-3 bg-muted/10 hover:bg-muted/30 transition-colors"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {fav.image ? (
                      <Image src={fav.image} alt={fav.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                        <Building2 className="h-6 w-6 opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{fav.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span>{fav.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No favorite shops yet.
            </div>
          )}
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card title="Recent Bookings" icon={History}>
        {user.recentBookings && user.recentBookings.length > 0 ? (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border/60">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">
                    Booking #
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">
                    Shop
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">
                    Date & Time
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-xs uppercase tracking-wider text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {user.recentBookings.map((booking: BookingListItem) => (
                  <tr key={booking.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{booking.bookingNumber}</td>
                    <td className="px-4 py-3">{booking.shopName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>{format(new Date(booking.date), 'dd MMM yyyy')}</div>
                      <div className="text-[10px] text-muted-foreground">{booking.startTime}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] uppercase px-1.5 py-0',
                          booking.status === 'CONFIRMED' && 'bg-emerald-50 text-emerald-700',
                          booking.status === 'COMPLETED' && 'bg-blue-50 text-blue-700',
                          booking.status === 'CANCELLED' && 'bg-red-50 text-red-700',
                          booking.status === 'PENDING' && 'bg-amber-50 text-amber-700'
                        )}
                      >
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                        <Link href={`/dashboard/bookings/${booking.id}`}>Details</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">No recent bookings.</div>
        )}
      </Card>

      {/* FelboCoin Action Modal */}
      <CoinActionModal
        type={coinModalType}
        userId={user.id}
        userName={user.name}
        currentBalance={user.felboCoinBalance}
        onClose={() => setCoinModalType(null)}
        onSuccess={handleCoinSuccess}
      />
    </div>
  );
}
