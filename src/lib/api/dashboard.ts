import { api } from "./client";
import type { Alert, DashboardChartsData, DashboardOverview } from "./types";

export const dashboardApi = {
  overview: (businessId: string, year?: number, month?: number) =>
    api.get<DashboardOverview>("/api/v1/dashboard/overview", {
      query: { businessId, year, month },
    }),

  charts: (businessId: string, months = 6) =>
    api.get<DashboardChartsData>("/api/v1/dashboard/charts", {
      query: { businessId, months },
    }),

  alerts: (businessId: string, unreadOnly = false) =>
    api.get<Alert[]>("/api/v1/dashboard/alerts", {
      query: { businessId, unreadOnly },
    }),
};
