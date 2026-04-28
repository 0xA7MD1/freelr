import { api, apiRequest } from "./client";
import type { CreateExpensePayload, Expense, ExpenseCategory, UploadReceiptResponse } from "./types";

function normalizeExpense(e: Expense): Expense {
  return {
    ...e,
    date: e.expenseDate ?? e.date ?? "",
    // Map API's categoryName → category so display code works unchanged
    category: e.category ?? e.categoryName ?? "",
  };
}

export const expensesApi = {
  getCategories: (businessId: string) =>
    api.get<ExpenseCategory[]>("/api/v1/expenses/categories", { query: { businessId } }),

  list: (businessId: string, from?: string, to?: string) =>
    api
      .get<Expense[]>("/api/v1/expenses", { query: { businessId, from, to } })
      .then((list) => list.map(normalizeExpense)),

  getById: (expenseId: string, businessId: string) =>
    api
      .get<Expense>(`/api/v1/expenses/${expenseId}`, { query: { businessId } })
      .then(normalizeExpense),

  create: (payload: CreateExpensePayload) =>
    api.post<{ id: string }>("/api/v1/expenses", payload),

  update: (expenseId: string, payload: CreateExpensePayload & { updatedBy?: string }) =>
    api.put<void>(`/api/v1/expenses/${expenseId}`, payload),

  remove: (expenseId: string, businessId: string, deletedBy: string) =>
    api.delete<void>(`/api/v1/expenses/${expenseId}`, {
      query: { businessId, deletedBy },
    }),

  uploadReceipt: (expenseId: string, businessId: string, updatedBy: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiRequest<UploadReceiptResponse>(
      `/api/v1/expenses/${expenseId}/receipt`,
      { method: "POST", body: form, query: { businessId, updatedBy } },
    );
  },
};
