import { api } from "./client";
import type { NotificationItem } from "./types";

export const notificationsApi = {
  // REVIEW: check if this matches the backend before connecting
  list: () => api.get<NotificationItem[]>("/api/v1/notifications"),
  // REVIEW: check if this matches the backend before connecting
  markAllRead: () => api.post<{ ok: true }>("/api/v1/notifications/read-all"),
};
