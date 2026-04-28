import { api } from "./client";
import type { CreateInvoicePayload, Invoice, RecordPaymentPayload } from "./types";

export const invoicesApi = {
  list: (businessId: string) =>
    api.get<Invoice[]>("/api/v1/invoices", { query: { businessId } }),

  getById: (invoiceId: string, businessId: string) =>
    api.get<Invoice>(`/api/v1/invoices/${invoiceId}`, { query: { businessId } }),

  create: (payload: CreateInvoicePayload) =>
    api.post<{ id: string }>("/api/v1/invoices", payload),

  send: (invoiceId: string, businessId: string, updatedBy: string) =>
    api.post<void>(`/api/v1/invoices/${invoiceId}/send`, undefined, {
      query: { businessId, updatedBy },
    }),

  recordPayment: (invoiceId: string, payload: RecordPaymentPayload) =>
    api.post<void>(`/api/v1/invoices/${invoiceId}/payment`, payload),

  generatePdf: (invoiceId: string, businessId: string, updatedBy: string) =>
    api.post<{ pdfUrl: string }>(`/api/v1/invoices/${invoiceId}/generate-pdf`, undefined, {
      query: { businessId, updatedBy },
    }),

  generateQr: (invoiceId: string, businessId: string, updatedBy: string) =>
    api.post<{ qrCodeUrl: string }>(`/api/v1/invoices/${invoiceId}/generate-qr`, undefined, {
      query: { businessId, updatedBy },
    }),

  generatePaymentLink: (invoiceId: string, businessId: string, updatedBy: string) =>
    api.post<{ paymentLink: string }>(`/api/v1/invoices/${invoiceId}/payment-link`, undefined, {
      query: { businessId, updatedBy },
    }),

  delete: (invoiceId: string, businessId: string, deletedBy: string) =>
    api.delete<void>(`/api/v1/invoices/${invoiceId}`, {
      query: { businessId, deletedBy },
    }),
};
