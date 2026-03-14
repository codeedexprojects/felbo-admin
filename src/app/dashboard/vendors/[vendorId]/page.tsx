'use client';

import { useParams, useRouter } from 'next/navigation';
import { useVendorDetail } from '@/features/vendors/hooks';
import { WorkingHours } from '@/features/vendors/types';
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
  Image as ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
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

// ─── Working hours row ────────────────────────────────────────────────────────
function WorkingHoursSection({ workingHours }: { workingHours: WorkingHours }) {
  const dayNames: { key: keyof WorkingHours; label: string }[] = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
      {dayNames.map((day) => {
        const hours = workingHours[day.key];
        return (
          <div
            key={day.key}
            className="flex items-center justify-between py-1 border-b border-border/40 last:border-0 sm:last:border-b"
          >
            <span className="text-xs font-medium text-muted-foreground">{day.label}</span>
            <span className="text-xs font-semibold text-foreground">
              {hours.isOpen ? (
                `${formatTime(hours.open)} - ${formatTime(hours.close)}`
              ) : (
                <span className="text-red-500">Closed</span>
              )}
            </span>
          </div>
        );
      })}
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
  const [expanded, setExpanded] = useState(index === 0); // first shop open by default
  const [showHours, setShowHours] = useState(false);

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
    <Card className="border-border/60 shadow-md transition-all hover:shadow-lg overflow-hidden group">
      {/* Shop header — always visible */}
      <CardHeader
        className="cursor-pointer pb-4 select-none bg-gradient-to-r from-muted/30 to-background"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 shadow-sm transition-transform group-hover:scale-105">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-foreground truncate">{shop.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/50 px-1.5 rounded">
                {shop.shopType}
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {shop.address.city}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight ring-1',
                shop.isAvailable
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                  : 'bg-gray-100 text-gray-500 ring-gray-200'
              )}
            >
              {shop.isAvailable ? 'Available' : 'Unavailable'}
            </span>
            <div
              className={cn(
                'p-1 rounded-full bg-muted/50 transition-transform duration-300',
                expanded && 'rotate-180'
              )}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-6 pt-5 bg-card">
          {/* Working Hours Accordion */}
          {shop.workingHours && (
            <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHours(!showHours);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors"
                type="button"
              >
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-primary" />
                  <span>Working Hours</span>
                </div>
                {showHours ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {showHours && (
                <div className="px-4 pb-4 pt-1">
                  <WorkingHoursSection workingHours={shop.workingHours} />
                </div>
              )}
            </div>
          )}

          {/* Basic shop info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <InfoRow icon={Phone} label="Shop Phone" value={shop.phone} />
              {addressLine && <InfoRow icon={MapPin} label="Full Address" value={addressLine} />}
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-bold">
                    Rating
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {shop.rating.average.toFixed(1)}{' '}
                    <span className="font-normal text-muted-foreground ml-1">
                      ({shop.rating.count} reviews)
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/5 text-primary border border-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                  {shop.onboardingStatus}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border border-border">
                  {shop.status}
                </span>
              </div>
            </div>
          </div>

          {/* Shop Photos */}
          {shop.photos && shop.photos.length > 0 && (
            <div className="space-y-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                <ImageIcon className="h-3.5 w-3.5" />
                Shop Gallery ({shop.photos.length})
              </p>
              <div className="flex gap-3 pb-2 overflow-x-auto scrollbar-hide snap-x">
                {shop.photos.map((photo, i) => (
                  <div
                    key={i}
                    className="relative h-32 w-48 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm transition-all hover:scale-[1.02] snap-start"
                  >
                    <Image
                      src={photo}
                      alt={`${shop.name} photo ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Barbers */}
          {shop.barberCount > 0 && (
            <div className="space-y-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                <Scissors className="h-3.5 w-3.5" />
                Staff Members ({shop.barberCount})
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {shop.barbers.map((barber) => (
                  <div
                    key={barber.id}
                    className="group/barber relative flex items-center gap-4 rounded-xl border border-border/60 bg-muted/10 p-4 transition-all hover:bg-muted/20 hover:border-primary/20"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-background ring-2 ring-primary/10 shadow-sm">
                      {barber.photo ? (
                        <Image src={barber.photo} alt={barber.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-lg">
                          {barber.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 pr-6">
                      <p className="truncate text-sm font-bold text-foreground leading-tight">
                        {barber.name}
                      </p>
                      <p className="truncate text-[11px] font-medium text-muted-foreground mt-0.5">
                        {barber.phone}
                      </p>
                    </div>
                    <div className="absolute top-3 right-3">
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full',
                          barber.isAvailable
                            ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                            : 'bg-gray-300'
                        )}
                        title={barber.isAvailable ? 'Online' : 'Offline'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {shop.serviceCount > 0 && (
            <div className="space-y-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                <Wrench className="h-3.5 w-3.5" />
                Menu & Pricing ({shop.serviceCount})
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {shop.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between gap-4 rounded-xl border border-border/60 bg-muted/10 p-4 transition-all hover:border-primary/10 hover:shadow-sm"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">{service.name}</p>
                      {service.description && (
                        <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed italic">
                          &quot;{service.description}&quot;
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-primary">₹{service.basePrice}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                        {service.baseDurationMinutes} MIN
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for barbers+services */}
          {shop.barberCount === 0 && shop.serviceCount === 0 && (
            <div className="flex flex-col items-center justify-center py-10 rounded-xl bg-muted/5 border-2 border-dashed border-border/40">
              <Scissors className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Inventory not yet configured
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                This vendor has not added any staff or menu items.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VendorDetailsPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const router = useRouter();
  const { data: vendor, isLoading, isError } = useVendorDetail(vendorId);

  if (isLoading)
    return (
      <RoleGuard allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
        <DetailSkeleton />
      </RoleGuard>
    );

  if (isError || !vendor)
    return (
      <RoleGuard allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
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
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
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
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {vendor.registrationType}
            </span>
          </div>
        </div>

        {/* ── Vendor info + Cancellations ── */}
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
              {vendor.associationMemberId && (
                <InfoRow icon={Building2} label="Member ID" value={vendor.associationMemberId} />
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

          {/* Cancellations */}
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
        </div>

        {/* ── Documents ── */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4" /> Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <DocLink label="Shop License" url={vendor.documents?.shopLicense} />
            <DocLink label="Owner ID Proof" url={vendor.documents?.ownerIdProof} />
            {vendor.associationIdProofUrl && (
              <DocLink label="Association ID Proof" url={vendor.associationIdProofUrl} />
            )}
          </CardContent>
        </Card>

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
