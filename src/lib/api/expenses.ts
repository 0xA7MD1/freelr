import { api, apiRequest } from "./client";
import type { CreateExpensePayload, Expense, UploadReceiptResponse } from "./types";

export const expensesApi = {
  // REVIEW: check if this matches the backend before connecting
  list: () => api.get<Expense[]>("/api/v1/expenses"),
  // REVIEW: check if this matches the backend before connecting
  create: (payload: CreateExpensePayload) => api.post<Expense>("/api/v1/expenses", payload),
  // REVIEW: check if this matches the backend before connecting
  remove: (id: string) => api.delete<{ ok: true }>(`/api/v1/expenses/${id}`),
  // REVIEW: check if this matches the backend before connecting
  uploadReceipt: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiRequest<UploadReceiptResponse>(`/api/v1/expenses/${id}/receipt`, {
      method: "POST",
      body: form,
    });
  },
};
