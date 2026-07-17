export type NotificationAudience = 'all' | 'users' | 'barbers' | 'vendors';

export interface BroadcastNotificationInput {
  audience: NotificationAudience;
  title: string;
  body: string;
  imageUrl?: string;
}

export interface BroadcastNotificationResponse {
  success: boolean;
  message: string;
}
