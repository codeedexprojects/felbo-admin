'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAvatars, addAvatar, deleteAvatar } from './api';

export function useAvatars() {
  return useQuery({
    queryKey: ['avatars'],
    queryFn: getAvatars,
  });
}

export function useAddAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => addAvatar(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAvatar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatars'] });
    },
  });
}
