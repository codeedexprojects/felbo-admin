'use client';

import React from 'react';
import { Banknote, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { usePayoutEarningSummary } from '../hooks';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function PayoutEarningsSummary() {
  const { data, isLoading } = usePayoutEarningSummary();

  const cards = [
    {
      label: 'Total Earned',
      value: data?.totalEarned ?? 0,
      sub: `${data?.totalBookings ?? 0} bookings × ₹2`,
      icon: Banknote,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      label: 'Confirmed',
      value: data?.totalConfirmed ?? 0,
      sub: 'Amount verified & received',
      icon: CheckCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      label: 'Pending Verification',
      value: data?.pendingVerification ?? 0,
      sub: 'Sent by super admin, awaiting your confirmation',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      label: 'Disputed',
      value: data?.disputed ?? 0,
      sub: 'Amount not received',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        You earn ₹2 per booking from vendors under your association. Super admin sends payouts
        directly — confirm receipt once the amount is credited to your account.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm ${card.border}`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.bg}`}
            >
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {isLoading ? '—' : formatCurrency(card.value)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
