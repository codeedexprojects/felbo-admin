'use client';

import { useParams, useRouter } from 'next/navigation';
import { useVendorDetail } from '@/features/vendors/hooks';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  Star,
  Scissors,
  Wrench,
  FileText,
  AlertTriangle,
  ShieldOff,
  Flag,
  MapPin,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

// ─── Status pill ─────────────────────────────────────────────────────────────
function StatusPill({ status, type }: { status: string; type: 'verification' | 'account' }) {
  const verificationMap: Record<string, string> = {
    APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    REJECTED: 'bg-red-50 text-red-600 ring-red-200',
    PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  };
  const accountMap: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    SUSPENDED: 'bg-red-50 text-red-600 ring-red-200',
    DELETED: 'bg-gray-100 text-gray-500 ring-gray-200',
    PENDING: 'bg-gray-100 text-gray-500 ring-gray-200',
  };
  const map = type === 'verification' ? verificationMap : accountMap;
  const cls = map[status] || 'bg-gray-100 text-gray-500 ring-gray-200';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1',
        cls
      )}
    >
      {status}
    </span>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null | number;
}) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ─── Document link ────────────────────────────────────────────────────────────
function DocLink({ label, url }: { label: string; url?: string }) {
  if (!url)
    return (
      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">Not uploaded</span>
      </div>
    );
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-muted/30"
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-xs font-medium text-primary">View →</span>
    </a>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

// ─── Shop card (collapsible) ──────────────────────────────────────────────────
function ShopCard({
  shop,
  index,
}: {
  shop: NonNullable<ReturnType<typeof useVendorDetail>['data']>['shops'][number];
  index: number;
}) {
  const [expanded, setExpanded] = useState(index === 0);

  const addressLine = [
    shop.address.line1,
    shop.address.line2,
    shop.address.area,
    shop.address.city,
    shop.address.district,
    shop.address.state,
    shop.address.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader
        className="cursor-pointer pb-3 select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{shop.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {shop.shopType} · {shop.address.city}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium ring-1',
                shop.isActive
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                  : 'bg-gray-100 text-gray-500 ring-gray-200'
              )}
            >
              {shop.isActive ? 'Active' : 'Inactive'}
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-5 pt-0">
          <div className="space-y-3">
            <InfoRow icon={Phone} label="Shop Phone" value={shop.phone} />
            {addressLine && <InfoRow icon={MapPin} label="Address" value={addressLine} />}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                <Star className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Rating</p>
                <p className="text-sm font-medium text-foreground">
                  {shop.rating.average.toFixed(1)}{' '}
                  <span className="font-normal text-muted-foreground">
                    ({shop.rating.count} reviews)
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                {shop.onboardingStatus}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                {shop.status}
              </span>
            </div>
          </div>

          {shop.barberCount > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Scissors className="h-3.5 w-3.5" />
                Barbers ({shop.barberCount})
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {shop.barbers.map((barber) => (
                  <div
                    key={barber.id}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {barber.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{barber.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{barber.phone}</p>
                    </div>
                    <span
                      className={cn(
                        'ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1',
                        barber.isActive
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                          : 'bg-gray-100 text-gray-500 ring-gray-200'
                      )}
                    >
                      {barber.isActive ? 'Active' : 'Off'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {shop.serviceCount > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Wrench className="h-3.5 w-3.5" />
                Services ({shop.serviceCount})
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {shop.services.map((service) => (
                  <div
                    key={service.id}
                    className="space-y-1 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
                  >
                    <p className="text-sm font-medium text-foreground">{service.name}</p>
                    {service.description && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-primary">
                        ₹{service.basePrice}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {service.baseDuration} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {shop.barberCount === 0 && shop.serviceCount === 0 && (
            <p className="text-center text-xs text-muted-foreground italic py-3">
              No barbers or services set up yet.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AssociationVendorDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const router = useRouter();
  const { data: vendor, isLoading, isError } = useVendorDetail(vendorId);

  if (isLoading)
    return (
      <RoleGuard allowedRoles={['ASSOCIATION_ADMIN']}>
        <DetailSkeleton />
      </RoleGuard>
    );

  if (isError || !vendor)
    return (
      <RoleGuard allowedRoles={['ASSOCIATION_ADMIN']}>
        <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 opacity-40" />
          <p className="text-sm">Vendor not found or failed to load.</p>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </RoleGuard>
    );

  return (
    <RoleGuard allowedRoles={['ASSOCIATION_ADMIN']}>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="-ml-1 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex flex-1 flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{vendor.ownerName}</h1>
            <StatusPill status={vendor.verificationStatus} type="verification" />
            <StatusPill status={vendor.status} type="account" />
            {vendor.isBlocked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 ring-1 ring-red-200">
                <ShieldOff className="h-3 w-3" /> Blocked
              </span>
            )}
            {vendor.isFlagged && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600 ring-1 ring-orange-200">
                <Flag className="h-3 w-3" /> Flagged
              </span>
            )}
            {vendor.associationMemberId && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Member #{vendor.associationMemberId}
              </span>
            )}
          </div>
        </div>

        {/* ── Vendor info + Shop ── */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Vendor Info */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Vendor Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={Phone} label="Phone" value={vendor.phone} />
              <InfoRow icon={Mail} label="Email" value={vendor.email} />
              <InfoRow
                icon={User}
                label="Registered"
                value={format(new Date(vendor.registrationDate), 'dd MMM yyyy')}
              />
              {vendor.verifiedAt && (
                <InfoRow
                  icon={User}
                  label="Verified At"
                  value={format(new Date(vendor.verifiedAt), 'dd MMM yyyy')}
                />
              )}
              {vendor.verificationNote && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700">
                    Verification Note
                  </p>
                  <p className="mt-1 text-sm text-amber-800">{vendor.verificationNote}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Cancellations + Documents ── */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Cancellations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/40 p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{vendor.cancellationCount}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Total</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {vendor.cancellationsThisWeek}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">This week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4" /> Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DocLink label="Shop License" url={vendor.documents?.shopLicense} />
              <DocLink label="Owner ID Proof" url={vendor.documents?.ownerIdProof} />
              {vendor.associationIdProofUrl && (
                <DocLink label="Association ID Proof" url={vendor.associationIdProofUrl} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Shops ── */}
        {vendor.shops.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Shops</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {vendor.shops.length}
              </span>
            </div>
            {vendor.shops.map((shop, i) => (
              <ShopCard key={shop.id} shop={shop} index={i} />
            ))}
          </div>
        ) : (
          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex h-24 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Building2 className="h-6 w-6 opacity-30" />
              <p className="text-sm">No shops set up yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}
