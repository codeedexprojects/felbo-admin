'use client';

import { useMutation } from '@tanstack/react-query';
import { broadcastNotification } from './api';

export const useBroadcastNotification = () => {
  return useMutation({
    mutationFn: broadcastNotification,
  });
};
