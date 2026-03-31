'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getUserById, blockUser, unblockUser } from './api';
import { ListUsersFilter } from './types';

export const useUsers = (filters: ListUsersFilter) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useUserById = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
};

export const useBlockUser = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => blockUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUnblockUser = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unblockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
