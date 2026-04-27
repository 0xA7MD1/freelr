import { api } from "./client";

export const rolesApi = {
  // REVIEW: check if this matches the backend before connecting
  list: () => api.get<string[]>("/api/v1/roles"),
};
