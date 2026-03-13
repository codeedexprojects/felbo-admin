'use client';

import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileText,
  CreditCard,
  BadgeCheck,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { useVendorRequestDetail, useVerifyVendor, useRejectVendor } from '@/features/vendors/hooks';
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
import { useState } from 'react';
import { cn } from '@/lib/utils';

/* ─── Helpers ─────────────────────────────────────────────────── */

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    REJECTED: 'bg-red-50 text-red-600 ring-red-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
        map[status] ?? 'bg-gray-100 text-gray-600 ring-gray-200'
      )}
    >
      {status === 'PENDING' && <Clock className="h-3 w-3" />}
      {status === 'APPROVED' && <CheckCircle2 className="h-3 w-3" />}
      {status === 'REJECTED' && <XCircle className="h-3 w-3" />}
      {status}
    </span>
  );
}

function DocLink({ label, url }: { label: string; url?: string }) {
  if (!url) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground italic">Not provided</span>
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40 hover:border-primary/40 group"
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
    </a>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────────── */

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

/* ─── Page ─────────────────────────────────────────────────────── */

export default function VendorRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = useVendorRequestDetail(id);
  const verifyMutation = useVerifyVendor();
  const rejectMutation = useRejectVendor();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleApprove = async () => {
    try {
      await verifyMutation.mutateAsync(id);
      setApproveOpen(false);
      router.push('/dashboard/vendors/requests');
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to approve vendor');
    }
  };

  const handleReject = async () => {
    if (!reason.trim() || reason.trim().length < 5) {
      alert('Please provide a rejection reason (min 5 characters)');
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id, reason });
      setRejectOpen(false);
      router.push('/dashboard/vendors/requests');
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to reject vendor');
    }
  };

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'SUB_ADMIN']}>
      <div className="space-y-6">
        {/* Top nav */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="-ml-1 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Button>

        {isLoading && <PageSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card py-20 text-muted-foreground">
            <AlertCircle className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm font-medium">Failed to load request details</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        )}

        {data && (
          <>
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-foreground">{data.ownerName}</h1>
                  <StatusBadge status={data.verificationStatus} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.registrationType === 'ASSOCIATION'
                    ? 'Association Member'
                    : 'Independent Vendor'}
                  {' · '}
                  Registered {safeFormat(data.registrationDate, 'dd MMM yyyy')}
                </p>
              </div>

              {/* Actions — only for PENDING */}
              {data.verificationStatus === 'PENDING' && (
                <div className="flex gap-2">
                  {/* Approve */}
                  <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Vendor Application?</DialogTitle>
                        <DialogDescription>
                          This will approve <strong>{data.ownerName}</strong>. They will be able to
                          log in and start accepting bookings immediately.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleApprove}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={verifyMutation.isPending}
                        >
                          {verifyMutation.isPending && (
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
                        className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="h-5 w-5" />
                          Reject Application
                        </DialogTitle>
                        <DialogDescription>
                          Provide a reason for rejecting this application. The vendor will be
                          notified.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-3 py-3">
                        <Label htmlFor="reason">Rejection Reason</Label>
                        <Textarea
                          id="reason"
                          placeholder="e.g. Invalid ID proof, Shop location verify failed..."
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={rejectMutation.isPending}
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
              )}

              {/* Show rejection note if rejected */}
              {data.verificationStatus === 'REJECTED' && data.verificationNote && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 max-w-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{data.verificationNote}</span>
                </div>
              )}
            </div>

            {/* Content grid */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* Owner Info */}
              <Section title="Owner Information" icon={User}>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <Field label="Full Name" value={data.ownerName} />
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
                    label="Email"
                    value={
                      data.email ? (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {data.email}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Not provided</span>
                      )
                    }
                  />
                  <Field
                    label="Registration Type"
                    value={
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
                          data.registrationType === 'ASSOCIATION'
                            ? 'bg-blue-50 text-blue-700 ring-blue-200'
                            : 'bg-purple-50 text-purple-700 ring-purple-200'
                        )}
                      >
                        {data.registrationType}
                      </span>
                    }
                  />
                  <Field
                    label="Registered On"
                    value={safeFormat(data.registrationDate, 'dd MMM yyyy, hh:mm a')}
                  />
                </div>
              </Section>

              {/* Shop Details */}
              <Section title="Shop Details" icon={Building2}>
                {data.shopDetails ? (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <Field label="Shop Name" value={data.shopDetails.name} />
                    <Field
                      label="Shop Type"
                      value={
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
                          {data.shopDetails.type}
                        </span>
                      }
                    />
                    <div className="col-span-2">
                      <Field
                        label="Address"
                        value={
                          <span className="flex items-start gap-1.5 leading-relaxed">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span>
                              {[
                                data.shopDetails.address.line1,
                                data.shopDetails.address.line2,
                                data.shopDetails.address.area,
                                data.shopDetails.address.city,
                                data.shopDetails.address.district,
                                data.shopDetails.address.state,
                                data.shopDetails.address.pincode,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          </span>
                        }
                      />
                    </div>
                    {data.shopDetails.location && (
                      <div className="col-span-2">
                        <Field
                          label="GPS Coordinates"
                          value={
                            <span className="font-mono text-xs text-muted-foreground">
                              {data.shopDetails.location.coordinates[1]}°N,{' '}
                              {data.shopDetails.location.coordinates[0]}°E
                            </span>
                          }
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No shop details submitted.</p>
                )}
              </Section>

              {/* Shop Photos */}
              {data.shopDetails?.photos && data.shopDetails.photos.length > 0 && (
                <Section title="Shop Photos" icon={ImageIcon}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {data.shopDetails.photos.map((photo, i) => (
                      <div
                        key={i}
                        className="relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-muted"
                      >
                        <Image
                          src={photo}
                          alt={`Shop photo ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Association-specific */}
              {data.registrationType === 'ASSOCIATION' && (
                <Section title="Association Details" icon={BadgeCheck}>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <Field
                      label="Member ID"
                      value={
                        <span className="font-mono text-sm">{data.associationMemberId ?? '—'}</span>
                      }
                    />
                    <div className="col-span-2">
                      <Field
                        label="Association ID Proof"
                        value={
                          data.associationIdProofUrl ? (
                            <a
                              href={data.associationIdProofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                            >
                              View Document
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">
                              Not provided
                            </span>
                          )
                        }
                      />
                    </div>
                  </div>
                </Section>
              )}

              {/* Independent Payment */}
              {data.registrationType === 'INDEPENDENT' && (
                <Section title="Registration Payment" icon={CreditCard}>
                  {data.registrationPayment ? (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                      <Field
                        label="Amount Paid"
                        value={
                          <span className="text-emerald-600 font-semibold">
                            ₹{data.registrationPayment.amount}
                          </span>
                        }
                      />
                      <Field
                        label="Payment ID"
                        value={
                          <span className="font-mono text-xs text-muted-foreground">
                            {data.registrationPayment.paymentId}
                          </span>
                        }
                      />
                      <Field
                        label="Paid On"
                        value={safeFormat(data.registrationPayment.paidAt, 'dd MMM yyyy, hh:mm a')}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Payment not yet confirmed.
                    </p>
                  )}
                </Section>
              )}

              {/* Documents */}
              <Section title="Verification Documents" icon={FileText}>
                <div className="space-y-3">
                  <DocLink label="Shop License" url={data.documents?.shopLicense} />
                  <DocLink label="Owner ID Proof" url={data.documents?.ownerIdProof} />
                </div>
              </Section>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
