'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Trash2,
  Pencil,
  CalendarDays,
  ImageIcon,
  Loader2,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/PageHeader';

import { useEvents, useUpdateEvent, useDeleteEvent } from '@/features/events/hooks';
import { EventItem, UpdateEventInput } from '@/features/events/types';
import { EventImageUploader } from '@/features/events/EventImageUploader';

// ── Edit schema ───────────────────────────────────────────────────────────────

const editEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  image: z.string().min(1, 'Event image is required'),
  date: z.string().optional(),
  isActive: z.boolean().optional(),
});

type EditEventFormValues = z.infer<typeof editEventSchema>;

// ── Skeleton ──────────────────────────────────────────────────────────────────

function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

// ── Event Card ────────────────────────────────────────────────────────────────

function EventCard({
  event,
  onEdit,
  onDelete,
}: {
  event: EventItem;
  onEdit: (event: EventItem) => void;
  onDelete: (event: EventItem) => void;
}) {
  return (
    <div className="group relative rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      {/* Image */}
      <div className="relative h-44 w-full bg-muted overflow-hidden">
        {event.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

        <div className="absolute top-2 right-2">
          <Badge
            className={`text-[10px] border-none backdrop-blur-sm ${
              event.isActive ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'
            }`}
          >
            {event.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 gap-1.5 bg-white/90 hover:bg-white text-foreground"
            onClick={() => onEdit(event)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 gap-1.5"
            onClick={() => onDelete(event)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>

        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          {event.date ? (
            <span className="flex items-center gap-1 text-[10px] text-primary/80 font-medium">
              <CalendarDays className="h-3 w-3" />
              {format(new Date(event.date), 'dd MMM yyyy, HH:mm')}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">No date set</span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(event.createdAt), 'dd MMM yyyy')}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditEventModal({
  open,
  onClose,
  event,
}: {
  open: boolean;
  onClose: () => void;
  event: EventItem | null;
}) {
  const updateEvent = useUpdateEvent(event?.id || '');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditEventFormValues>({
    resolver: zodResolver(
      editEventSchema
    ) as import('react-hook-form').Resolver<EditEventFormValues>,
  });

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description,
        image: event.image,
        date: event.date || '',
        isActive: event.isActive,
      });
    }
  }, [event, reset]);

  const onSubmit = (values: EditEventFormValues) => {
    const payload: UpdateEventInput = {
      title: values.title,
      description: values.description,
      image: values.image,
      isActive: values.isActive,
      ...(values.date ? { date: values.date } : {}),
    };

    updateEvent.mutate(payload, {
      onSuccess: () => {
        onClose();
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>Update the details of this event.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 py-2 overflow-y-auto flex-1 pr-1"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <Input {...register('title')} placeholder="Event title" className="h-9 text-sm" />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Event Image</label>
            <EventImageUploader
              value={watch('image')}
              onChange={(url) => setValue('image', url, { shouldValidate: true })}
              onClear={() => setValue('image', '', { shouldValidate: true })}
              error={errors.image?.message}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Date <span className="text-muted-foreground/60 font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-1.5">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'h-9 px-3 text-sm font-normal border-border/60 justify-start gap-2',
                      !watch('date') && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {watch('date')
                      ? format(new Date(watch('date')!), 'dd MMM yyyy')
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ModernDatePicker
                    selected={watch('date') ? new Date(watch('date')!) : undefined}
                    onSelect={(date) =>
                      setValue('date', date ? date.toISOString() : '', { shouldValidate: true })
                    }
                  />
                </PopoverContent>
              </Popover>
              {watch('date') && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setValue('date', '', { shouldValidate: true })}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
            <input
              type="checkbox"
              id="edit-isActive"
              {...register('isActive')}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <label htmlFor="edit-isActive" className="text-sm text-foreground cursor-pointer">
              Active
            </label>
            <span className="text-xs text-muted-foreground">
              Inactive events are hidden from users.
            </span>
          </div>

          {updateEvent.isError && (
            <p className="text-xs text-red-500">{(updateEvent.error as Error)?.message}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateEvent.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateEvent.isPending} className="gap-1.5">
              {updateEvent.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isError } = useEvents({ page, limit });
  const deleteEventMutation = useDeleteEvent();

  const [editModal, setEditModal] = useState<{ open: boolean; event: EventItem | null }>({
    open: false,
    event: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; event: EventItem | null }>({
    open: false,
    event: null,
  });

  const handleConfirmDelete = () => {
    if (!deleteModal.event) return;
    deleteEventMutation.mutate(deleteModal.event.id, {
      onSuccess: () => {
        deleteEventMutation.reset();
        setDeleteModal({ open: false, event: null });
        if (data && data.events.length === 1 && page > 1) {
          setPage((p) => p - 1);
        }
      },
    });
  };

  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Manage events displayed in the app."
        action={
          <Button size="sm" className="gap-1.5 h-8 bg-primary hover:bg-primary/90" asChild>
            <Link href="/dashboard/events/new">
              <Plus className="h-3.5 w-3.5" />
              New Event
            </Link>
          </Button>
        }
      />

      {/* Summary bar */}
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {isLoading ? (
              <Skeleton className="inline-block h-3.5 w-32" />
            ) : total === 0 ? (
              'No events'
            ) : (
              <>
                Showing{' '}
                <span className="font-semibold text-foreground">
                  {rangeStart}–{rangeEnd}
                </span>{' '}
                of <span className="font-semibold text-foreground">{total}</span> event
                {total !== 1 ? 's' : ''}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Grid */}
      {isError ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center text-sm text-muted-foreground">
          Failed to load events. Please refresh the page.
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : data?.events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-card p-16 text-center space-y-3">
          <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No events yet</p>
          <p className="text-xs text-muted-foreground/70">
            Click &quot;New Event&quot; to create your first event.
          </p>
          <Button size="sm" className="gap-1.5 mt-2" asChild>
            <Link href="/dashboard/events/new">
              <Plus className="h-3.5 w-3.5" /> New Event
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={(e) => setEditModal({ open: true, event: e })}
              onDelete={(e) => {
                deleteEventMutation.reset();
                setDeleteModal({ open: true, event: e });
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          Page {page} of {totalPages || 1}
          {total > 0 && ` · ${total} event${total !== 1 ? 's' : ''}`}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-border/60"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-border/60"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <EditEventModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, event: null })}
        event={editModal.event}
      />

      {/* Delete Confirm */}
      <AlertDialog
        open={deleteModal.open}
        onOpenChange={(v) => {
          if (!v && !deleteEventMutation.isPending) {
            deleteEventMutation.reset();
            setDeleteModal({ open: false, event: null });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteModal.event?.title}&rdquo;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteEventMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                {(deleteEventMutation.error as Error)?.message || 'Failed to delete event.'}
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteEventMutation.isPending}
              onClick={() => {
                deleteEventMutation.reset();
                setDeleteModal({ open: false, event: null });
              }}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteEventMutation.isPending}
              onClick={handleConfirmDelete}
              className="gap-1.5"
            >
              {deleteEventMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {deleteEventMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
