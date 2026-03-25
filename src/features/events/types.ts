export interface EventItem {
  id: string;
  title: string;
  description: string;
  image: string;
  date?: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListEventsFilter {
  page: number;
  limit: number;
}

export interface ListEventsResponse {
  events: EventItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateEventInput {
  title: string;
  description: string;
  image: string;
  date?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  image?: string;
  date?: string;
  isActive?: boolean;
}
