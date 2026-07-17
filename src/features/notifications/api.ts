import apiClient from '@/lib/axios';
import { BroadcastNotificationInput, BroadcastNotificationResponse } from './types';

export const broadcastNotification = async (
  payload: BroadcastNotificationInput
): Promise<BroadcastNotificationResponse> => {
  const res = await apiClient.post<BroadcastNotificationResponse>(
    '/admin/notifications/broadcast',
    payload
  );
  return res.data;
};
