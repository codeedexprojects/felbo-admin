'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllConfigs, getConfigsByCategory, updateConfig } from './api';

export const useAllConfigs = () => {
  return useQuery({
    queryKey: ['system-config'],
    queryFn: getAllConfigs,
  });
};

export const useConfigsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['system-config', category],
    queryFn: () => getConfigsByCategory(category),
    enabled: !!category,
  });
};

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => updateConfig(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
    },
  });
};
