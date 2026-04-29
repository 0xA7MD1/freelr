import { api } from "./client";
import type { Alert } from "./types";

export const alertsApi = {
  list: (businessId: string, unreadOnly = false) =>
    api.get<Alert[]>("/api/v1/alerts", { query: { businessId, unreadOnly } }),

  markRead: (alertId: string, businessId: string) =>
    api.post<void>(`/api/v1/alerts/${alertId}/read`, undefined, { query: { businessId } }),

  dismiss: (alertId: string, businessId: string, deletedBy: string) =>
    api.delete<void>(`/api/v1/alerts/${alertId}`, { query: { businessId, deletedBy } }),
};
