import { api } from "./client";
import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from "./types";

export const authApi = {
  // REVIEW: check if this matches the backend before connecting
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/api/v1/auth/login", payload, { auth: false }),
  // REVIEW: check if this matches the backend before connecting
  register: (payload: RegisterPayload) =>
    api.post<void>("/api/v1/auth/register", payload, { auth: false }),
  // REVIEW: check if this matches the backend before connecting
  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<{ ok: true }>("/api/v1/auth/forgot-password", payload, { auth: false }),
  // REVIEW: check if this matches the backend before connecting
  me: () => api.get<User>("/api/v1/auth/me"),
  // REVIEW: check if this matches the backend before connecting
  logout: () => api.post<{ ok: true }>("/api/v1/auth/logout"),
  // REVIEW: check if this matches the backend before connecting
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/api/v1/auth/refresh", { refreshToken }, { auth: false }),
};
