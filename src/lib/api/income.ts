import { api } from "./client";
import type { CreateIncomePayload, IncomeCategory, IncomeEntry } from "./types";

function normalizeIncome(e: IncomeEntry): IncomeEntry {
  return {
    ...e,
    source: e.description ?? e.source ?? "",
    incomeDate: e.transactionDate ?? e.incomeDate ?? "",
    category: e.category ?? e.categoryName ?? "",
  };
}

export const incomeApi = {
  getCategories: (businessId: string) =>
    api.get<IncomeCategory[]>("/api/v1/income/categories", { query: { businessId } }),

  list: (businessId: string, from?: string, to?: string) =>
    api
      .get<IncomeEntry[]>("/api/v1/income", { query: { businessId, from, to } })
      .then((list) => list.map(normalizeIncome)),

  getById: (incomeId: string, businessId: string) =>
    api
      .get<IncomeEntry>(`/api/v1/income/${incomeId}`, { query: { businessId } })
      .then(normalizeIncome),

  create: (payload: CreateIncomePayload) =>
    api.post<{ id: string }>("/api/v1/income", payload),

  update: (incomeId: string, payload: CreateIncomePayload & { updatedBy?: string }) =>
    api.put<void>(`/api/v1/income/${incomeId}`, payload),

  remove: (incomeId: string, businessId: string, deletedBy: string) =>
    api.delete<void>(`/api/v1/income/${incomeId}`, {
      query: { businessId, deletedBy },
    }),
};
