import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import {
  EventItem,
  ListEventsFilter,
  ListEventsResponse,
  CreateEventInput,
  UpdateEventInput,
} from './types';

export const getEvents = async (filters: ListEventsFilter): Promise<ListEventsResponse> => {
  const params = new URLSearchParams({
    page: filters.page.toString(),
    limit: filters.limit.toString(),
  });

  const response = await apiClient.get<ApiResponse<ListEventsResponse>>(
    `/admin/events?${params.toString()}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch events');
  }

  return response.data.data;
};

export const getEventById = async (id: string): Promise<EventItem> => {
  const response = await apiClient.get<ApiResponse<EventItem>>(`/admin/events/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch event');
  }

  return response.data.data;
};

export const createEvent = async (input: CreateEventInput): Promise<EventItem> => {
  const response = await apiClient.post<ApiResponse<EventItem>>('/admin/events', input);

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to create event');
  }

  return response.data.data;
};

export const updateEvent = async (id: string, input: UpdateEventInput): Promise<EventItem> => {
  const response = await apiClient.put<ApiResponse<EventItem>>(`/admin/events/${id}`, input);

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to update event');
  }

  return response.data.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/events/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to delete event');
  }
};
