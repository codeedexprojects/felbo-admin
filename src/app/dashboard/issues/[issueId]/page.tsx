'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Image as ImageIcon, User, Store, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useIssueById } from '@/features/issues/hooks';
import {
  IssueStatus,
  IssueType,
  RefundStatus,
  ISSUE_TYPE_LABELS,
  REFUND_STATUS_LABELS,
} from '@/features/issues/types';

// ── Badge helpers ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: IssueStatus }) {
  const map: Record<IssueStatus, string> = {
    OPEN: 'bg-amber-50 text-amber-700 ring-amber-200',
    RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    REJECTED: 'bg-red-50 text-red-600 ring-red-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
        map[status]
      )}
    >
      {status}
    </span>
  );
}

function RefundBadge({ status }: { status: RefundStatus }) {
  const map: Record<RefundStatus, string> = {
    NONE: 'bg-gray-100 text-gray-500 ring-gray-200',
    PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
    ISSUED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    FAILED: 'bg-red-50 text-red-600 ring-red-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
        map[status]
      )}
    >
      {REFUND_STATUS_LABELS[status]}
    </span>
  );
}

function TypeBadge({ type }: { type: IssueType }) {
  const map: Record<IssueType, string> = {
    SHOP_CLOSED: 'bg-slate-50 text-slate-700 ring-slate-200',
    BARBER_UNAVAILABLE: 'bg-purple-50 text-purple-700 ring-purple-200',
    SERVICE_NOT_PROVIDED: 'bg-orange-50 text-orange-700 ring-orange-200',
    QUALITY_ISSUE: 'bg-blue-50 text-blue-700 ring-blue-200',
    OTHER: 'bg-gray-100 text-gray-600 ring-gray-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
        map[type]
      )}
    >
      {ISSUE_TYPE_LABELS[type]}
    </span>
  );
}

// ── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 w-32">{label}</span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────────────────

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
    <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

function IssueDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/60 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="px-4 py-2 space-y-0">
              {Array.from({ length: 4 }).map((_, j) => (
                <div
                  key={j}
                  className="flex justify-between py-3 border-b border-border/30 last:border-0"
                >
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function IssueDetailPage({ params }: { params: { issueId: string } }) {
  const { issueId } = params;
  const { data: issue, isLoading, isError } = useIssueById(issueId);

  if (isLoading) return <IssueDetailSkeleton />;

  if (isError || !issue) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/issues">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Issues
          </Link>
        </Button>
        <div className="rounded-xl border border-border/60 bg-card p-8 text-center text-muted-foreground">
          <p className="text-sm">Issue not found or failed to load.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/issues">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Issues
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Issue Detail</h2>
          <p className="text-xs text-muted-foreground font-mono">{issue.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={issue.status} />
          <RefundBadge status={issue.refundStatus} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Issue info */}
        <Card title="Issue Info" icon={Store}>
          <InfoRow label="Type" value={<TypeBadge type={issue.type} />} />
          <InfoRow
            label="Booking ID"
            value={<span className="font-mono text-xs">{issue.bookingId}</span>}
          />
          <InfoRow label="Status" value={<StatusBadge status={issue.status} />} />
          <InfoRow label="Refund Status" value={<RefundBadge status={issue.refundStatus} />} />
          {issue.reviewedBy && (
            <InfoRow
              label="Reviewed By"
              value={<span className="font-mono text-xs">{issue.reviewedBy}</span>}
            />
          )}
          <InfoRow
            label="Reported"
            value={format(new Date(issue.createdAt), 'dd MMM yyyy, hh:mm a')}
          />
          <InfoRow
            label="Updated"
            value={format(new Date(issue.updatedAt), 'dd MMM yyyy, hh:mm a')}
          />
          <div className="py-3">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground leading-relaxed">{issue.description}</p>
          </div>
        </Card>

        {/* User info */}
        <Card title="User" icon={User}>
          {issue.user ? (
            <>
              <InfoRow label="Name" value={issue.user.name} />
              <InfoRow
                label="Phone"
                value={<span className="font-mono text-xs">{issue.user.phone}</span>}
              />
              <InfoRow
                label="User ID"
                value={<span className="font-mono text-xs">{issue.user.id}</span>}
              />
            </>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">User info unavailable.</p>
          )}
        </Card>

        {/* Vendor info */}
        <Card title="Vendor" icon={Scissors}>
          {issue.vendor ? (
            <>
              <InfoRow label="Owner" value={issue.vendor.name} />
              <InfoRow
                label="Phone"
                value={<span className="font-mono text-xs">{issue.vendor.phone}</span>}
              />
              <InfoRow
                label="Vendor ID"
                value={<span className="font-mono text-xs">{issue.vendor.id}</span>}
              />
            </>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">Vendor info unavailable.</p>
          )}
        </Card>

        {/* Shop info */}
        <Card title="Shop" icon={Store}>
          {issue.shop ? (
            <>
              <InfoRow label="Shop Name" value={issue.shop.name} />
              <InfoRow
                label="Phone"
                value={<span className="font-mono text-xs">{issue.shop.phone}</span>}
              />
              <InfoRow label="Area" value={issue.shop.address.area} />
              <InfoRow label="City" value={issue.shop.address.city} />
              <InfoRow
                label="Shop ID"
                value={<span className="font-mono text-xs">{issue.shop.id}</span>}
              />
            </>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">Shop info unavailable.</p>
          )}
        </Card>
      </div>

      {/* Photo + Location (optional) */}
      {(issue.photoUrl || issue.userLocation) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {issue.photoUrl && (
            <Card title="Photo Evidence" icon={ImageIcon}>
              <div className="py-3">
                <img
                  src={issue.photoUrl}
                  alt="Issue photo"
                  className="w-full rounded-lg object-cover max-h-64"
                />
              </div>
            </Card>
          )}
          {issue.userLocation && (
            <Card title="User Location" icon={MapPin}>
              <InfoRow label="Latitude" value={issue.userLocation.lat} />
              <InfoRow label="Longitude" value={issue.userLocation.lng} />
              <div className="py-3">
                <a
                  href={`https://maps.google.com/?q=${issue.userLocation.lat},${issue.userLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Open in Google Maps →
                </a>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
