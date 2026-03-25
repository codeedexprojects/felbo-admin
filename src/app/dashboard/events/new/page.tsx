'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Loader2,
  CalendarDays,
  ImageIcon,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { cn } from '@/lib/utils';
import { useCreateEvent } from '@/features/events/hooks';
import { CreateEventInput } from '@/features/events/types';
import { EventImageUploader } from '@/features/events/EventImageUploader';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  image: z.string().min(1, 'Event image is required'),
  date: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function NewEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema) as import('react-hook-form').Resolver<EventFormValues>,
  });

  const watchedImage = watch('image');
  const watchedDate = watch('date');

  const onSubmit = (values: EventFormValues) => {
    const payload: CreateEventInput = {
      title: values.title,
      description: values.description,
      image: values.image,
      ...(values.date ? { date: values.date } : {}),
    };

    createEvent.mutate(payload, {
      onSuccess: () => router.push('/dashboard/events'),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard/events">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Events
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">New Event</h1>
        <p className="text-sm text-muted-foreground">Create an event to be displayed in the app.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Event Details ── */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Event Details</h2>
          </div>

          <Field label="Title" required error={errors.title?.message}>
            <Input
              {...register('title')}
              placeholder="e.g. Annual KSBA Meet 2026"
              className="h-10 text-sm"
            />
          </Field>

          <Field label="Description" required error={errors.description?.message}>
            <textarea
              {...register('description')}
              placeholder="Describe what this event is about…"
              rows={4}
              className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </Field>

          <Field
            label="Event Image"
            required
            hint="Upload a JPG, PNG, or WebP image (max 10 MB)."
            error={errors.image?.message}
          >
            <EventImageUploader
              value={watchedImage}
              onChange={(url) => setValue('image', url, { shouldValidate: true })}
              onClear={() => setValue('image', '', { shouldValidate: true })}
              error={errors.image?.message}
            />
          </Field>
        </div>

        {/* ── Schedule ── */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Schedule</h2>
          </div>

          <Field
            label="Event Date"
            hint="Set when this event takes place. Leave empty if not scheduled yet."
            error={errors.date?.message}
          >
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'h-10 px-3 text-sm font-normal border-border/60 justify-start gap-2',
                      !watchedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {watchedDate ? format(new Date(watchedDate), 'dd MMM yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ModernDatePicker
                    selected={watchedDate ? new Date(watchedDate) : undefined}
                    onSelect={(date) =>
                      setValue('date', date ? date.toISOString() : '', { shouldValidate: true })
                    }
                  />
                </PopoverContent>
              </Popover>
              {watchedDate ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setValue('date', '', { shouldValidate: true })}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Optional</span>
              )}
            </div>
          </Field>
        </div>

        {/* Error */}
        {createEvent.isError && (
          <p className="text-sm text-red-500 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
            {(createEvent.error as Error)?.message}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 justify-end border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/events')}
            disabled={createEvent.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createEvent.isPending} className="gap-2 min-w-[130px]">
            {createEvent.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createEvent.isPending ? 'Creating…' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}
