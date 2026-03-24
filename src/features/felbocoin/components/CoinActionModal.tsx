'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, MinusCircle, Coins } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useCreditCoins, useDebitCoins } from '../hooks';

export type CoinActionType = 'credit' | 'debit';

export interface CoinActionModalProps {
  type: CoinActionType | null;
  userId: string;
  userName: string;
  currentBalance: number;
  onClose: () => void;
  /** Called after a successful mutation — use to invalidate related queries */
  onSuccess?: () => void;
}

const coinActionSchema = z.object({
  coins: z
    .number({ error: 'Enter a valid number' })
    .int('Must be a whole number')
    .min(1, 'Minimum 1 coin')
    .max(10000, 'Maximum 10,000 coins'),
  reason: z
    .string()
    .min(5, 'Reason must be at least 5 characters')
    .max(200, 'Reason must be at most 200 characters'),
});

type CoinActionForm = z.infer<typeof coinActionSchema>;

export function CoinActionModal({
  type,
  userId,
  userName,
  currentBalance,
  onClose,
  onSuccess,
}: CoinActionModalProps) {
  const creditMutation = useCreditCoins(userId);
  const debitMutation = useDebitCoins(userId);

  const mutation = type === 'credit' ? creditMutation : debitMutation;
  const isCredit = type === 'credit';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    watch,
  } = useForm<CoinActionForm>({
    resolver: zodResolver(coinActionSchema),
  });

  // Reset form when modal closes or type changes
  useEffect(() => {
    if (!type) reset();
  }, [type, reset]);

  const coinsValue = watch('coins');

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: CoinActionForm) => {
    mutation.mutate(data, {
      onSuccess: () => {
        onSuccess?.();
        handleClose();
      },
      onError: (err) => {
        setError('root', { message: err.message });
      },
    });
  };

  const previewBalance =
    typeof coinsValue === 'number' && !isNaN(coinsValue)
      ? isCredit
        ? currentBalance + coinsValue
        : currentBalance - coinsValue
      : null;

  return (
    <Dialog open={!!type} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCredit ? (
              <PlusCircle className="h-5 w-5 text-emerald-600" />
            ) : (
              <MinusCircle className="h-5 w-5 text-red-600" />
            )}
            {isCredit ? 'Credit Coins' : 'Debit Coins'}
          </DialogTitle>
          <DialogDescription>
            {isCredit
              ? `Add FelboCoins to ${userName}'s account.`
              : `Remove FelboCoins from ${userName}'s account.`}
          </DialogDescription>
        </DialogHeader>

        {/* Balance preview */}
        <div className="flex items-center justify-between rounded-lg bg-muted/40 border border-border/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4 text-amber-500" />
            Current balance
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold font-mono">
            <span>{currentBalance.toLocaleString()}</span>
            {previewBalance !== null && (
              <>
                <span className="text-muted-foreground/50">→</span>
                <span
                  className={
                    isCredit
                      ? 'text-emerald-600'
                      : previewBalance < 0
                        ? 'text-red-600'
                        : 'text-red-500'
                  }
                >
                  {previewBalance.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="coins" className="text-sm">
              Number of Coins
            </Label>
            <Input
              id="coins"
              type="number"
              min={1}
              max={10000}
              placeholder="e.g. 100"
              className="h-9"
              {...register('coins', { valueAsNumber: true })}
            />
            {errors.coins && <p className="text-xs text-red-500">{errors.coins.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="reason" className="text-sm">
              Reason{' '}
              <span className="text-muted-foreground font-normal text-xs">(min. 5 chars)</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Reason for this action..."
              className="h-20 resize-none"
              {...register('reason')}
            />
            {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
          </div>

          {errors.root && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-200">
              {errors.root.message}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className={
                isCredit
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {mutation.isPending
                ? isCredit
                  ? 'Crediting...'
                  : 'Debiting...'
                : isCredit
                  ? 'Confirm Credit'
                  : 'Confirm Debit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
