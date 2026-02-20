'use client';

import { useQuery } from '@tanstack/react-query';
import { getIssues, getIssueById } from './api';
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
