import { api } from "./client";
import type {
  AuthResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  User,
} from "./types";

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/api/v1/auth/login", payload, { auth: false }),

  register: (payload: RegisterPayload) =>
    api.post<void>("/api/v1/auth/register", payload, { auth: false }),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<{ message: string }>("/api/v1/auth/forgot-password", payload, { auth: false }),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post<void>("/api/v1/auth/reset-password", payload, { auth: false }),

  /** Rotates the access token using a refresh token. Body key is `token` per API spec. */
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/api/v1/auth/refresh-token", { token: refreshToken }, { auth: false }),

  /** Revokes the refresh token. */
  logout: (refreshToken: string) =>
    api.post<void>("/api/v1/auth/logout", { refreshToken }, { auth: false }),

  /** Returns the profile of the currently authenticated user. */
  profile: () => api.get<User>("/api/v1/auth/profile"),

  changePassword: (payload: ChangePasswordPayload) =>
    api.post<void>("/api/v1/auth/change-password", payload),

  updateProfile: (payload: UpdateProfilePayload) =>
    api.post<void>("/api/v1/auth/update-profile", payload),
};
