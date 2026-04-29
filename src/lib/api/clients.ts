import { api } from "./client";
import type { Client, CreateClientPayload, UpdateClientPayload } from "./types";

export const clientsApi = {
  list: (businessId: string) =>
    api.get<Client[]>("/api/v1/clients", { query: { businessId } }),

  getById: (clientId: string, businessId: string) =>
    api.get<Client>(`/api/v1/clients/${clientId}`, { query: { businessId } }),

  create: (payload: CreateClientPayload) =>
    api.post<{ id: string }>("/api/v1/clients", payload),

  update: (clientId: string, payload: UpdateClientPayload) =>
    api.put<void>(`/api/v1/clients/${clientId}`, payload),

  delete: (clientId: string, businessId: string, deletedBy: string) =>
    api.delete<void>(`/api/v1/clients/${clientId}`, {
      query: { businessId, deletedBy },
    }),
};
