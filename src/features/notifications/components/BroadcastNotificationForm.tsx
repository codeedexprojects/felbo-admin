'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send, Users, Scissors, Store, Globe } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBroadcastNotification } from '../hooks';
import { NotificationAudience } from '../types';

const broadcastSchema = z.object({
  audience: z.enum(['all', 'users', 'barbers', 'vendors']),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or fewer'),
  body: z
    .string()
    .min(1, 'Message body is required')
    .max(500, 'Body must be 500 characters or fewer'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type BroadcastFormValues = z.infer<typeof broadcastSchema>;

const AUDIENCE_OPTIONS: {
  value: NotificationAudience;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  { value: 'all', label: 'Everyone', icon: Globe, description: 'All users, barbers, and vendors' },
  { value: 'users', label: 'Users only', icon: Users, description: 'App users only' },
  { value: 'barbers', label: 'Barbers only', icon: Scissors, description: 'All barbers' },
  { value: 'vendors', label: 'Vendors only', icon: Store, description: 'All vendors' },
];

export function BroadcastNotificationForm() {
  const { mutate: broadcast, isPending } = useBroadcastNotification();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      audience: 'all',
      title: '',
      body: '',
      imageUrl: '',
    },
  });

  const audience = watch('audience');
  const bodyValue = watch('body');

  const onSubmit = (data: BroadcastFormValues) => {
    const payload = {
      audience: data.audience,
      title: data.title,
      body: data.body,
      ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
    };

    broadcast(payload, {
      onSuccess: (result) => {
        toast.success(result.message);
        reset();
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to send notification');
      },
    });
  };

  const selectedAudience = AUDIENCE_OPTIONS.find((o) => o.value === audience);
  const AudienceIcon = selectedAudience?.icon ?? Globe;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-primary">Broadcast Push Notification</CardTitle>
        <CardDescription>
          Send a push notification to a specific audience segment or to all platform users.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          {/* Audience */}
          <div className="grid gap-2">
            <Label htmlFor="audience">Audience</Label>
            <Select
              value={audience}
              onValueChange={(val) => setValue('audience', val as NotificationAudience)}
            >
              <SelectTrigger id="audience">
                <div className="flex items-center gap-2">
                  <AudienceIcon className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select audience" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {AUDIENCE_OPTIONS.map(({ value, label, icon: Icon, description }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium leading-none">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.audience && (
              <p className="text-xs text-destructive">{errors.audience.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input id="title" placeholder="e.g. New offer available!" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Body */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Message Body</Label>
              <span className="text-xs text-muted-foreground">{bodyValue.length}/500</span>
            </div>
            <Textarea
              id="body"
              placeholder="Write your notification message..."
              className="resize-none"
              rows={4}
              {...register('body')}
            />
            {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
          </div>

          {/* Image URL (optional) */}
          <div className="grid gap-2">
            <Label htmlFor="imageUrl">
              Image URL <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.png"
              {...register('imageUrl')}
            />
            {errors.imageUrl && (
              <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              A banner image shown inside the notification (where supported).
            </p>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
          <Button type="submit" disabled={isPending} className="gap-2">
            <Send className="h-4 w-4" />
            {isPending ? 'Sending...' : 'Send Notification'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
