import { api } from "./client";
import type { Business, CreateBusinessPayload, UpdateBusinessPayload } from "./types";

export const businessApi = {
  getByOwner: (ownerId: string) =>
    api.get<Business>("/api/v1/business", { query: { ownerId } }),

  create: (payload: CreateBusinessPayload) =>
    api.post<{ id: string }>("/api/v1/business", payload),

  update: (businessId: string, payload: UpdateBusinessPayload) =>
    api.put<void>(`/api/v1/business/${businessId}`, payload),
};
