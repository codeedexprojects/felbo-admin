'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Building2,
  Scissors,
  Wrench,
  User,
  Star,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RoleGuard } from '@/components/layout/RoleGuard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePendingShopDetails, useApproveShop, useRejectShop } from '@/features/shops/hooks';
import { IWorkingHours } from '@/features/shops/types';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function safeFormat(value: string | null | undefined, fmt: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return format(d, fmt);
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="text-sm font-medium text-foreground">{value ?? '—'}</div>
    </div>
  );
}

function ShopTypePill({ type }: { type: string }) {
  const map: Record<string, string> = {
    MENS: 'bg-blue-50 text-blue-700 ring-blue-200',
    WOMENS: 'bg-pink-50 text-pink-700 ring-pink-200',
    UNISEX: 'bg-violet-50 text-violet-700 ring-violet-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
        map[type] ?? 'bg-gray-100 text-gray-500 ring-gray-200'
      )}
    >
      {type}
    </span>
  );
}

/* ─── Working Hours ────────────────────────────────────────────────────────── */

function WorkingHoursGrid({ workingHours }: { workingHours: IWorkingHours }) {
  const days: { key: keyof IWorkingHours; label: string }[] = [
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
    <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
      {days.map(({ key, label }) => {
        const hours = workingHours[key];
        return (
          <div
            key={key}
            className="flex items-center justify-between border-b border-border/40 py-2 last:border-0 sm:last:border-b"
          >
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <span className="text-xs font-semibold text-foreground">
              {hours.isOpen ? (
                `${formatTime(hours.open)} – ${formatTime(hours.close)}`
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

/* ─── Skeleton ──────────────────────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-md bg-muted" />
      <div className="grid gap-5 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-4 rounded-xl border border-border/60 bg-card p-5">
            <div className="h-4 w-32 rounded bg-muted" />
            {[1, 2, 3].map((j) => (
              <div key={j} className="space-y-1.5">
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="h-4 w-36 rounded bg-muted" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function PendingShopDetailsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = usePendingShopDetails(shopId);
  const approveMutation = useApproveShop();
  const rejectMutation = useRejectShop();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(shopId);
      setApproveOpen(false);
      router.push('/dashboard/shops/approval');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to approve shop');
    }
  };

  const handleReject = async () => {
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Please provide a rejection reason (min 5 characters)');
      return;
    }
    try {
      await rejectMutation.mutateAsync({ shopId, reason: reason.trim() });
      setRejectOpen(false);
      router.push('/dashboard/shops/approval');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to reject shop');
    }
  };

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
      <div className="space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="-ml-1 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Approvals
        </Button>

        {isLoading && <PageSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card py-20 text-muted-foreground">
            <AlertCircle className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm font-medium">Failed to load shop details</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        )}

        {data && (
          <>
            {/* ── Header ── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-foreground">{data.name}</h1>
                  <ShopTypePill type={data.shopType} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.address.area}, {data.address.city}
                  {' · '}
                  Submitted {safeFormat(data.createdAt, 'dd MMM yyyy')}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {/* Approve */}
                <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-1.5 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Shop?</DialogTitle>
                      <DialogDescription>
                        This will activate <strong>{data.name}</strong>. The shop will become
                        visible to customers and can start accepting bookings.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setApproveOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleApprove}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                        disabled={approveMutation.isPending}
                      >
                        {approveMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Confirm Approval
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Reject */}
                <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        Reject Shop
                      </DialogTitle>
                      <DialogDescription>
                        Provide a reason for rejecting this shop. The vendor will be notified.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-3">
                      <Label htmlFor="reject-reason">Rejection Reason</Label>
                      <Textarea
                        id="reject-reason"
                        placeholder="e.g. Incomplete address, invalid location, photos missing..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setRejectOpen(false)}
                        disabled={rejectMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={rejectMutation.isPending || reason.trim().length < 5}
                      >
                        {rejectMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Confirm Rejection
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* ── Content grid ── */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* Shop Information */}
              <Section title="Shop Information" icon={Building2}>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <Field label="Shop Name" value={data.name} />
                  <Field label="Shop Type" value={<ShopTypePill type={data.shopType} />} />
                  <Field
                    label="Phone"
                    value={
                      <span className="flex items-center gap-1.5 font-mono">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {data.phone}
                      </span>
                    }
                  />
                  <Field
                    label="Rating"
                    value={
                      <span className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {data.rating.average} ({data.rating.count} reviews)
                      </span>
                    }
                  />
                  <Field
                    label="Created At"
                    value={
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {safeFormat(data.createdAt, 'dd MMM yyyy, hh:mm a')}
                      </span>
                    }
                  />
                  {data.description && (
                    <div className="col-span-2">
                      <Field label="Description" value={data.description} />
                    </div>
                  )}
                </div>
              </Section>

              {/* Vendor Information */}
              <Section title="Vendor Information" icon={User}>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <Field label="Vendor Name" value={data.vendor.name} />
                  <Field
                    label="Phone"
                    value={
                      <span className="flex items-center gap-1.5 font-mono">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {data.vendor.phone}
                      </span>
                    }
                  />
                  <Field
                    label="Email"
                    value={
                      data.vendor.email ? (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {data.vendor.email}
                        </span>
                      ) : (
                        <span className="text-xs italic text-muted-foreground">Not provided</span>
                      )
                    }
                  />
                </div>
              </Section>

              {/* Address */}
              <Section title="Address" icon={MapPin}>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <div className="col-span-2">
                    <Field label="Line 1" value={data.address.line1} />
                  </div>
                  {data.address.line2 && (
                    <div className="col-span-2">
                      <Field label="Line 2" value={data.address.line2} />
                    </div>
                  )}
                  <Field label="Area" value={data.address.area} />
                  <Field label="City" value={data.address.city} />
                  <Field label="District" value={data.address.district} />
                  <Field label="State" value={data.address.state} />
                  <Field label="Pincode" value={data.address.pincode} />
                </div>
              </Section>

              {/* Working Hours */}
              {data.workingHours && (
                <Section title="Working Hours" icon={Clock}>
                  <WorkingHoursGrid workingHours={data.workingHours} />
                </Section>
              )}
            </div>

            {/* ── Photos ── */}
            {data.photos.length > 0 && (
              <Section title={`Shop Photos (${data.photos.length})`} icon={ImageIcon}>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {data.photos.map((photo, i) => (
                    <div
                      key={i}
                      className="relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-muted"
                    >
                      <Image
                        src={photo}
                        alt={`${data.name} photo ${i + 1}`}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ── Services ── */}
            <Section title={`Services (${data.services.length})`} icon={Wrench}>
              {data.services.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">No services added yet.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/30">
                        {[
                          'Service Name',
                          'Price',
                          'Duration',
                          'Applicable For',
                          'Status',
                          'Description',
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.services.map((service, i) => (
                        <tr
                          key={service.id}
                          className={cn(
                            'border-b border-border/40 transition-colors hover:bg-muted/20',
                            i === data.services.length - 1 && 'border-0'
                          )}
                        >
                          <td className="px-4 py-3 font-medium text-foreground">{service.name}</td>
                          <td className="px-4 py-3 font-semibold text-foreground">
                            ₹{service.basePrice}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {service.baseDurationMinutes} min
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
                              {service.applicableFor}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1',
                                service.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                  : 'bg-gray-100 text-gray-500 ring-gray-200'
                              )}
                            >
                              {service.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {service.description ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            {/* ── Barbers ── */}
            <Section title={`Barbers (${data.barbers.length})`} icon={Scissors}>
              {data.barbers.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">No barbers added yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.barbers.map((barber) => (
                    <div
                      key={barber.id}
                      className="relative flex items-center gap-4 rounded-xl border border-border/60 bg-muted/10 p-4 transition-colors hover:bg-muted/20"
                    >
                      {/* Avatar */}
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-background ring-2 ring-primary/10 shadow-sm">
                        {barber.photo ? (
                          <Image
                            src={barber.photo}
                            alt={barber.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-bold text-primary">
                            {barber.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {barber.name}
                        </p>
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {barber.phone}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {barber.serviceCount} service{barber.serviceCount !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Availability dot */}
                      <div
                        className={cn(
                          'absolute right-3 top-3 h-2 w-2 rounded-full',
                          barber.isAvailable
                            ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                            : 'bg-gray-300'
                        )}
                        title={barber.isAvailable ? 'Available' : 'Unavailable'}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
