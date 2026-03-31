'use client';

import React from 'react';
import { X, Loader2, ImageIcon, Plus } from 'lucide-react';
import { useAvatars, useDeleteAvatar } from '../hooks';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AvatarUploader } from './AvatarUploader';

export function AvatarList() {
  const { data: avatars, isLoading } = useAvatars();
  const { mutateAsync: deleteAvatar, isPending: isDeleting } = useDeleteAvatar();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3 border border-border/40 rounded-3xl bg-muted/20">
        <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
        <p className="text-sm font-medium text-muted-foreground">Fetching avatar bank...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Add New Avatar</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Upload high-quality, transparent or themed profile photos for barbers. These will be
            selectable by vendors during shop setup.
          </p>
          <AvatarUploader />
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">
              Existing Bank
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {avatars?.length || 0}
              </span>
            </h3>
          </div>

          {!avatars || avatars.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 gap-4 border border-dashed border-border/80 rounded-3xl bg-muted/10">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No avatars available in the bank.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-border/50 bg-white shadow-sm transition-all hover:shadow-md hover:border-primary/20"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatar.imageUrl}
                    alt="Barber Avatar"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="flex items-center justify-center h-8 w-8 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all hover:scale-110 active:scale-95"
                          title="Delete avatar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl border-none p-8">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-bold">
                            Delete Avatar?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-base text-muted-foreground">
                            This will remove the image from the system. It will no longer be
                            available for new barber profiles. Existing barbers using this avatar
                            will keep it until changed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8 gap-3">
                          <AlertDialogCancel className="rounded-2xl border-border px-6">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAvatar(avatar.id)}
                            className="rounded-2xl bg-red-500 hover:bg-red-600 px-8"
                          >
                            Delete Forever
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
