import { api } from "./client";
import type { Invoice, RecordPaymentPayload } from "./types";

export const invoicesApi = {
  // REVIEW: check if this matches the backend before connecting
  list: (businessId: string) =>
    api.get<Invoice[]>("/api/v1/invoices", { query: { businessId } }),
  // REVIEW: check if this matches the backend before connecting
  create: (payload: { clientName: string; items: { description: string; amount: number }[] }) =>
    api.post<Invoice>("/api/v1/invoices", payload),
  // REVIEW: check if this matches the backend before connecting
  send: (id: string) => api.post<{ ok: true }>(`/api/v1/invoices/${id}/send`),
  // REVIEW: check if this matches the backend before connecting
  recordPayment: (id: string, payload: RecordPaymentPayload) =>
    api.post<{ ok: true }>(`/api/v1/invoices/${id}/payment`, payload),
};
