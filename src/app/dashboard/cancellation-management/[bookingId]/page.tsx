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
  Store,
  UserRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCancellationDetail } from '@/features/cancellation/hooks';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';

function safeFormat(value: string | null | undefined, fmt: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return format(d, fmt);
}

function formatTime12h(timeStr: string | null | undefined): string {
  if (!timeStr) return '—';
  try {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return format(date, 'hh:mm a');
  } catch {
    return timeStr;
  }
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

export default function CancellationDetailPage() {
  const params = useParams<{ bookingId: string }>();
  const id = params?.bookingId;
  const router = useRouter();

  const { data: cancellation, isLoading, isError } = useCancellationDetail(id as string);
  useSetPageTitle(cancellation?.bookingNumber);

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

  if (isError || !cancellation) {
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
          <p className="text-sm font-medium">Failed to load cancellation details</p>
        </div>
      </div>
    );
  }

  const { cancellation: c } = cancellation;

  return (
    <div className="space-y-6 pb-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="-ml-1 gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cancellations
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">
            Booking {cancellation.bookingNumber}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="destructive" className="text-[10px]">
              {cancellation.status}
            </Badge>
            <Badge variant="outline" className="text-[10px] uppercase">
              Cancelled by {c.cancelledBy}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Created on {safeFormat(cancellation.createdAt, 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* User Details */}
        <Section title="User Details" icon={User}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="Name" value={cancellation.user.name} />
            <Field label="Phone" value={cancellation.user.phone} />
          </div>
        </Section>

        {/* Shop Details */}
        <Section title="Shop Details" icon={Store}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="Shop Name" value={cancellation.shop.name} />
            <Field label="Phone" value={cancellation.shop.phone} />
            {cancellation.shop.address && (
              <div className="col-span-2">
                <Field
                  label="Address"
                  value={[
                    cancellation.shop.address.line1,
                    cancellation.shop.address.line2,
                    cancellation.shop.address.area,
                    cancellation.shop.address.city,
                    cancellation.shop.address.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                />
              </div>
            )}
          </div>
        </Section>

        {/* Vendor Details */}
        <Section title="Vendor Details" icon={MapPin}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="Owner Name" value={cancellation.vendor.ownerName} />
            <Field label="Phone" value={cancellation.vendor.phone} />
            {cancellation.vendor.email && <Field label="Email" value={cancellation.vendor.email} />}
          </div>
        </Section>

        {/* Barber Details */}
        <Section title="Barber Details" icon={UserRound}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="Name" value={cancellation.barber.name} />
            <Field label="Phone" value={cancellation.barber.phone} />
            {cancellation.barber.email && <Field label="Email" value={cancellation.barber.email} />}
          </div>
        </Section>

        {/* Appointment Details */}
        <Section title="Appointment Time" icon={Clock}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="Date" value={safeFormat(cancellation.date, 'EEEE, dd MMM yyyy')} />
            <Field
              label="Time"
              value={`${formatTime12h(cancellation.startTime)} - ${formatTime12h(cancellation.endTime)}`}
            />
            <Field label="Duration" value={`${cancellation.totalDurationMinutes} mins`} />
          </div>
        </Section>

        {/* Payment Details */}
        <Section title="Payment Details" icon={CreditCard}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="Total Amount" value={`₹${cancellation.totalServiceAmount}`} />
            <Field label="Advance Paid" value={`₹${cancellation.advancePaid}`} />
            <Field label="Remaining" value={`₹${cancellation.remainingAmount}`} />
            <Field
              label="Payment Method"
              value={
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {(cancellation.paymentMethod || '—').replace('_', ' ')}
                </Badge>
              }
            />
          </div>
        </Section>

        {/* Cancellation & Refund Details */}
        <Section title="Cancellation & Refund" icon={Ban}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field
              label="Cancelled By"
              value={
                <Badge
                  variant={c.cancelledBy === 'USER' ? 'secondary' : 'outline'}
                  className="text-[10px] uppercase"
                >
                  {c.cancelledBy}
                </Badge>
              }
            />
            <Field label="Cancelled At" value={safeFormat(c.cancelledAt, 'dd MMM yyyy, hh:mm a')} />
            <div className="col-span-2">
              <Field label="Reason" value={c.reason || 'Not provided'} />
            </div>
            <Field
              label="Refund Status"
              value={
                <Badge
                  variant={c.refundStatus === 'PROCESSED' ? 'default' : 'destructive'}
                  className={`text-[10px] ${c.refundStatus === 'PROCESSED' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                >
                  {c.refundStatus}
                </Badge>
              }
            />
            <Field
              label="Refund Type"
              value={
                <Badge variant="outline" className="text-[10px] uppercase">
                  {(c.refundType || '—').replace('_', ' ')}
                </Badge>
              }
            />
            {c.refundType !== 'FELBO_COINS' && (
              <Field label="Refund Amount" value={`₹${c.refundAmount}`} />
            )}
            {(c.refundCoins ?? 0) > 0 && <Field label="Refunded Coins" value={c.refundCoins} />}
          </div>
        </Section>
      </div>

      {/* Services Breakdown */}
      <h3 className="mt-8 mb-4 text-lg font-bold text-foreground flex items-center gap-2">
        <Scissors className="h-5 w-5 text-muted-foreground" />
        Services Booked
      </h3>
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden w-full">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                Service Name
              </th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">Duration</th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {cancellation.services.map((svc, idx) => (
              <tr key={idx} className="hover:bg-muted/20">
                <td className="px-5 py-3 font-medium">{svc.serviceName}</td>
                <td className="px-5 py-3 text-right text-muted-foreground">
                  {svc.durationMinutes} mins
                </td>
                <td className="px-5 py-3 text-right font-medium">₹{svc.price}</td>
              </tr>
            ))}
            <tr className="bg-muted/10 font-medium">
              <td colSpan={2} className="px-5 py-4 text-right">
                Total:
              </td>
              <td className="px-5 py-4 text-right">₹{cancellation.totalServiceAmount}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
