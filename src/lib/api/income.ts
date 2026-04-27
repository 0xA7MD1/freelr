import { api } from "./client";
import type { IncomeEntry } from "./types";

export const incomeApi = {
  // REVIEW: check if this matches the backend before connecting
  list: (businessId: string, from: string, to: string) =>
    api.get<IncomeEntry[]>("/api/v1/income", { query: { businessId, from, to } }),
};
