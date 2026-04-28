import { api } from "./client";
import type { NotificationApi, NotificationItem } from "./types";
import { format, parseISO } from "date-fns";
import { arSA } from "date-fns/locale";

function priorityToType(priority?: string): NotificationItem["type"] {
  switch (priority?.toLowerCase()) {
    case "urgent":
    case "high":
      return "warning";
    case "normal":
      return "info";
    default:
      return "info";
  }
}

function formatNotifTime(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return format(parseISO(dateStr), "dd MMM yyyy، hh:mm a", { locale: arSA });
  } catch {
    return dateStr;
  }
}

function normalize(n: NotificationApi): NotificationItem {
  return {
    id: n.id,
    title: n.title,
    description: n.message,
    time: formatNotifTime(n.createdDate),
    type: priorityToType(n.priority),
    read: n.isRead,
  };
}

export const notificationsApi = {
  // Raw API response (used by notifications tab)
  listRaw: (userId: string, unreadOnly = false) =>
    api.get<NotificationApi[]>("/api/v1/notifications", { query: { userId, unreadOnly } }),

  // Normalized (kept for backward compatibility)
  list: (userId: string, unreadOnly = false) =>
    api
      .get<NotificationApi[]>("/api/v1/notifications", { query: { userId, unreadOnly } })
      .then((list) => list.map(normalize)),

  markRead: (notificationId: string, userId: string) =>
    api.post<void>(`/api/v1/notifications/${notificationId}/read`, undefined, {
      query: { userId },
    }),

  markAllRead: (userId: string) =>
    api.post<void>("/api/v1/notifications/read-all", undefined, { query: { userId } }),

  delete: (notificationId: string, userId: string) =>
    api.delete<void>(`/api/v1/notifications/${notificationId}`, { query: { userId } }),
};
