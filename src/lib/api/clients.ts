import { api } from "./client";
import type { Client, CreateClientPayload } from "./types";

export const clientsApi = {
  // REVIEW: check if this matches the backend before connecting
  list: (businessId: string) =>
    api.get<Client[]>("/api/v1/clients", { query: { businessId } }),
  // REVIEW: check if this matches the backend before connecting
  create: (payload: CreateClientPayload) =>
    api.post<Client>("/api/v1/clients", payload),
};
