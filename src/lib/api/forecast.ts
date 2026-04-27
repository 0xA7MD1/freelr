import { api } from "./client";
import type { ForecastResponse } from "./types";

export const forecastApi = {
  // REVIEW: check if this matches the backend before connecting
  generate: () => api.post<ForecastResponse>("/api/v1/forecast/generate"),
};
