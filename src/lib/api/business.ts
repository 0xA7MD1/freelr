import { api } from "./client";
import type { Business } from "./types";

export const businessApi = {
  // REVIEW: check if this matches the backend before connecting
  getByOwner: (ownerId: string) =>
    api.get<Business>("/api/v1/business", { query: { ownerId } }),
};
