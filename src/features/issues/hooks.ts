'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getIssues,
  getIssueById,
  updateIssueStatus,
  flagVendorForIssue,
  processRefundForIssue,
} from './api';
import { IssueListFilter } from './types';

export const useIssues = (filters: IssueListFilter) => {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: () => getIssues(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useIssueById = (id: string) => {
  return useQuery({
    queryKey: ['issues', id],
    queryFn: () => getIssueById(id),
    enabled: !!id,
  });
};

export const useUpdateIssueStatus = (issueId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ status, reason }: { status: 'RESOLVED' | 'REJECTED'; reason: string }) =>
      updateIssueStatus(issueId, status, reason),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
};

export const useFlagVendorForIssue = (issueId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => flagVendorForIssue(issueId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
    },
  });
};

export const useProcessRefund = (issueId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => processRefundForIssue(issueId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
};
