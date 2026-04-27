import { api } from "./client";
import type { DashboardOverview } from "./types";

export const dashboardApi = {
  // REVIEW: check if this matches the backend before connecting
  overview: (businessId: string) =>
    api.get<DashboardOverview>("/api/v1/dashboard/overview", { query: { businessId } }),
};
