"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "@/lib/api/auth";
import { ApiError, isApiConfigured } from "@/lib/api/client";
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/lib/api/types";
import { authStorage } from "./storage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthSession {
  token: string;
  refreshToken: string | null;
  expiresAt: string | null;
  permissions: string[];
}

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  session: AuthSession | null;
  permissions: string[];
  login: (payload: LoginPayload & { remember?: boolean }) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const FALLBACK_USER: User = {
  id: "demo-user",
  firstName: "أحمد",
  lastName: "محمد",
  email: "ahmed@example.com",
  phone: "+971 50 123 4567",
  location: "دبي، الإمارات العربية المتحدة",
  plan: "trial",
};

function readSession(): AuthSession | null {
  const token = authStorage.getToken();
  if (!token) return null;
  return {
    token,
    refreshToken: authStorage.getRefreshToken(),
    expiresAt: authStorage.getExpiresAt(),
    permissions: authStorage.getPermissions(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const existing = readSession();
    if (!existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unauthenticated");
      return;
    }
    setSession(existing);
    if (!isApiConfigured()) {
      setUser(FALLBACK_USER);
      setStatus("authenticated");
      return;
    }
    let cancelled = false;
    authApi
      .me()
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setStatus("authenticated");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          authStorage.clear();
          setSession(null);
          setStatus("unauthenticated");
        } else {
          setUser(FALLBACK_USER);
          setStatus("authenticated");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback<AuthContextValue["login"]>(async ({ remember, ...payload }) => {
    if (!isApiConfigured()) {
      const demo: AuthSession = {
        token: "demo-token",
        refreshToken: "demo-refresh",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        permissions: [],
      };
      authStorage.setSession({
        token: demo.token,
        refreshToken: demo.refreshToken!,
        expiresAt: demo.expiresAt!,
        permissions: demo.permissions,
        remember: !!remember,
      });
      setSession(demo);
      setUser(FALLBACK_USER);
      setStatus("authenticated");
      return;
    }
    const res = await authApi.login(payload);
    authStorage.setSession({
      token: res.token,
      refreshToken: res.refreshToken,
      expiresAt: res.expiresAt,
      permissions: res.permissions,
      remember: !!remember,
    });
    setSession({
      token: res.token,
      refreshToken: res.refreshToken,
      expiresAt: res.expiresAt,
      permissions: res.permissions ?? [],
    });
    setUser({
      id: "",
      firstName: "",
      lastName: "",
      email: payload.email,
    });
    setStatus("authenticated");
  }, []);

  const register = useCallback<AuthContextValue["register"]>(async (payload) => {
    if (!isApiConfigured()) {
      const demo: AuthSession = {
        token: "demo-token",
        refreshToken: "demo-refresh",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        permissions: [],
      };
      authStorage.setSession({
        token: demo.token,
        refreshToken: demo.refreshToken!,
        expiresAt: demo.expiresAt!,
        permissions: demo.permissions,
      });
      setSession(demo);
      setUser({
        ...FALLBACK_USER,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phoneNumber,
      });
      setStatus("authenticated");
      return;
    }
    await authApi.register(payload);
  }, []);

  const forgotPassword = useCallback<AuthContextValue["forgotPassword"]>(async (payload) => {
    if (!isApiConfigured()) return;
    await authApi.forgotPassword(payload);
  }, []);

  const logout = useCallback<AuthContextValue["logout"]>(async () => {
    if (isApiConfigured()) {
      try {
        await authApi.logout();
      } catch {
        // ignore
      }
    }
    authStorage.clear();
    setSession(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      session,
      permissions: session?.permissions ?? [],
      login,
      register,
      forgotPassword,
      logout,
    }),
    [status, user, session, login, register, forgotPassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
