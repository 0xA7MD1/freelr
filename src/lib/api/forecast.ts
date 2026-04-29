import { api } from "./client";
import type { ForecastResponse } from "./types";

export const forecastApi = {
  getLatest: (businessId: string) =>
    api.get<ForecastResponse | null>("/api/v1/forecast", { query: { businessId } }),

  generate: (businessId: string, forecastMonths = 3) =>
    api.post<ForecastResponse>("/api/v1/forecast/generate", { businessId, forecastMonths }),
};
