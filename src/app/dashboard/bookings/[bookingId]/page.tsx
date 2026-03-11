'use client';

import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft,
  User,
  MapPin,
  Clock,
  CreditCard,
  Ban,
  AlertCircle,
  Scissors,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBookingDetail, useProcessRefund } from '@/features/bookings/hooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Safe date formatter matching other pages
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
    <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
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

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-md bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-1.5">
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="h-4 w-36 rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  const params = useParams<{ bookingId?: string; id?: string }>();
  // Use bookingId or catch-all id if not present
  const id = params?.bookingId || params?.id;
  const router = useRouter();

  const { data: booking, isLoading, isError } = useBookingDetail(id as string);
  const refundMutation = useProcessRefund();

  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const handleRefund = async () => {
    if (!refundReason.trim() || refundReason.trim().length < 5) {
      alert('Please provide a valid reason (min 5 characters)');
      return;
    }
    try {
      await refundMutation.mutateAsync({ id: id as string, reason: refundReason });
      setRefundOpen(false);
      // Wait a tick then optimistically reflect changes
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to process refund');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="-ml-1 gap-1.5 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <PageSkeleton />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="-ml-1 gap-1.5 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card py-20 text-muted-foreground">
          <AlertCircle className="mb-3 h-10 w-10 opacity-40" />
          <p className="text-sm font-medium">Failed to load booking details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="-ml-1 gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bookings
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">Booking {booking.bookingNumber}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={
                booking.status === 'COMPLETED'
                  ? 'default'
                  : booking.status === 'CONFIRMED'
                    ? 'secondary'
                    : 'destructive'
              }
              className={
                booking.status === 'COMPLETED' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
              }
            >
              {booking.status}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Created on {safeFormat(booking.createdAt, 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>

        {/* Action: Process Refund */}
        {booking.status === 'CANCELLED' &&
          booking.advancePaid > 0 &&
          (!booking.cancellation || booking.cancellation.refundStatus !== 'PROCESSED') && (
            <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
                  <RefreshCw className="h-4 w-4" />
                  Provide Manual Refund
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-orange-600" />
                    Issue Refund
                  </DialogTitle>
                  <DialogDescription>
                    This will process a manual refund of ₹{booking.advancePaid} back to the
                    user&apos;s payment method or wallet.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-3">
                  <Label htmlFor="reason">Refund Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="e.g. Approved manual cancellation"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRefundOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRefund}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={refundMutation.isPending}
                  >
                    {refundMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Refund
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* User Details */}
        {(booking.userName || booking.userPhone) && (
          <Section title="User Details" icon={User}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Name" value={booking.userName} />
              <Field label="Phone" value={booking.userPhone} />
            </div>
          </Section>
        )}

        {/* Vendor & Barber Details */}
        <Section title="Shop Details" icon={MapPin}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="Shop Name" value={booking.shopName} />
            <Field label="Primary Barber" value={booking.barberName || 'Any Available'} />
          </div>
        </Section>

        {/* Appointment Details */}
        <Section title="Appointment Time" icon={Clock}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="Date" value={safeFormat(booking.date, 'EEEE, dd MMM yyyy')} />
            <Field label="Time" value={`${booking.startTime} - ${booking.endTime}`} />
          </div>
        </Section>

        {/* Financial Details */}
        <Section title="Payment Details" icon={CreditCard}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="Total Amount" value={`₹${booking.totalServiceAmount}`} />
            <Field label="Advance Paid" value={`₹${booking.advancePaid}`} />
            <Field label="To Pay at Shop" value={`₹${booking.remainingAmount}`} />
            <Field
              label="Payment Method"
              value={
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {(booking.paymentMethod || '—').replace('_', ' ')}
                </Badge>
              }
            />
          </div>
        </Section>

        {/* Refund Box */}
        {booking.cancellation && (
          <Section title="Refund Logs" icon={Ban}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field
                label="Refund Status"
                value={
                  <span className="text-orange-600 font-semibold">
                    {booking.cancellation.refundStatus}
                  </span>
                }
              />
              <Field label="Amount" value={`₹${booking.cancellation.refundAmount}`} />
              <div className="col-span-2">
                <Field label="Reason" value={booking.cancellation.reason || 'Not provided'} />
              </div>
              {booking.cancellation.cancelledAt && (
                <div className="col-span-2">
                  <Field
                    label="Processed At"
                    value={safeFormat(booking.cancellation.cancelledAt, 'dd MMM yyyy, hh:mm a')}
                  />
                </div>
              )}
            </div>
          </Section>
        )}
      </div>

      {/* Services Breakdown */}
      <h3 className="mt-8 mb-4 text-lg font-bold text-foreground flex items-center gap-2">
        <Scissors className="h-5 w-5 text-muted-foreground" />
        Services Booked
      </h3>
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden w-full">
        <div className="w-full">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                  Service Name
                </th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Barber</th>
                <th className="px-5 py-3 text-right font-medium text-muted-foreground">Duration</th>
                <th className="px-5 py-3 text-right font-medium text-muted-foreground">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {booking.services.map((svc, idx) => (
                <tr key={idx} className="hover:bg-muted/20">
                  <td className="px-5 py-3 font-medium">{svc.serviceName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{booking.barberName}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">
                    {svc.durationMinutes} mins
                  </td>
                  <td className="px-5 py-3 text-right font-medium">₹{svc.price}</td>
                </tr>
              ))}
              <tr className="bg-muted/10 font-medium">
                <td colSpan={3} className="px-5 py-4 text-right">
                  Total:
                </td>
                <td className="px-5 py-4 text-right">₹{booking.totalServiceAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
