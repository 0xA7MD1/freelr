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
import { businessApi } from "@/lib/api/business";
import { ApiError, isApiConfigured } from "@/lib/api/client";
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/lib/api/types";
import { authStorage } from "./storage";

interface CreateBusinessInput {
  name: string;
  industry: string;
  currency: string;
}

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
  /** ID of the business owned by the current user. Null until loaded. */
  businessId: string | null;
  /** Currency code of the business (e.g. "USD", "AED"). Null until loaded. */
  currency: string | null;
  /** Update the currency in context + storage (call after business update). */
  setCurrency: (code: string) => void;
  login: (payload: LoginPayload & { remember?: boolean }) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
  logout: () => Promise<void>;
  createBusiness: (input: CreateBusinessInput) => Promise<void>;
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

const FALLBACK_BUSINESS_ID = "00000000-0000-0000-0000-000000000000";
const FALLBACK_CURRENCY = "AED";

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

/** Fetch profile then business, returning both. Falls back gracefully on errors. */
async function loadProfileAndBusiness(): Promise<{ user: User; businessId: string | null; currency: string | null }> {
  const user = await authApi.profile();
  if (user.id) authStorage.setUserId(user.id);

  let businessId: string | null = authStorage.getBusinessId();
  let currency: string | null = authStorage.getCurrency();

  if (!businessId && user.id) {
    try {
      const business = await businessApi.getByOwner(user.id);
      businessId = business.id;
      currency = business.currency;
      authStorage.setBusinessId(business.id);
      authStorage.setCurrency(business.currency);
    } catch {
      // business not yet created — caller will handle
    }
  } else if (businessId && !currency && user.id) {
    // businessId is cached but currency is not — fetch to hydrate it
    try {
      const business = await businessApi.getByOwner(user.id);
      currency = business.currency;
      authStorage.setCurrency(business.currency);
    } catch {
      // ignore — UI will fall back to a default
    }
  }
  return { user, businessId, currency };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(
    () => authStorage.getBusinessId(),
  );
  const [currency, setCurrencyState] = useState<string | null>(
    () => authStorage.getCurrency(),
  );

  useEffect(() => {
    const existing = readSession();
    if (!existing) {
      setStatus("unauthenticated");
      return;
    }
    setSession(existing);

    if (!isApiConfigured()) {
      setUser(FALLBACK_USER);
      setBusinessId(FALLBACK_BUSINESS_ID);
      setCurrencyState(FALLBACK_CURRENCY);
      setStatus("authenticated");
      return;
    }

    let cancelled = false;
    loadProfileAndBusiness()
      .then(({ user: u, businessId: bid, currency: cur }) => {
        if (cancelled) return;
        setUser(u);
        setBusinessId(bid);
        setCurrencyState(cur);
        setStatus("authenticated");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          authStorage.clear();
          setSession(null);
          setStatus("unauthenticated");
        } else {
          // Network error / API down — use cached data; null businessId → onboarding
          setUser(FALLBACK_USER);
          setBusinessId(authStorage.getBusinessId());
          setCurrencyState(authStorage.getCurrency());
          setStatus("authenticated");
        }
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback<AuthContextValue["login"]>(async ({ remember, ...payload }) => {
    if (!isApiConfigured()) {
      const demo: AuthSession = {
        token: "demo-token",
        refreshToken: "demo-refresh",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        permissions: [],
      };
      authStorage.setSession({ ...demo, token: demo.token, refreshToken: demo.refreshToken!, expiresAt: demo.expiresAt!, remember: !!remember });
      setSession(demo);
      setUser(FALLBACK_USER);
      setBusinessId(FALLBACK_BUSINESS_ID);
      setCurrencyState(FALLBACK_CURRENCY);
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

    // Fetch real profile + business after token is stored
    try {
      const { user: u, businessId: bid, currency: cur } = await loadProfileAndBusiness();
      setUser(u);
      setBusinessId(bid);
      setCurrencyState(cur);
    } catch {
      // Profile fetch failed — keep a minimal user so dashboard still renders
      setUser({ id: "", firstName: "", lastName: "", email: payload.email });
      setBusinessId(null);
      setCurrencyState(null);
    }
    setStatus("authenticated");
  }, []);

  const register = useCallback<AuthContextValue["register"]>(async (payload) => {
    if (!isApiConfigured()) {
      // Demo mode: auto-login after register
      const demo: AuthSession = {
        token: "demo-token",
        refreshToken: "demo-refresh",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        permissions: [],
      };
      authStorage.setSession({ ...demo, token: demo.token, refreshToken: demo.refreshToken!, expiresAt: demo.expiresAt! });
      setSession(demo);
      setUser({
        ...FALLBACK_USER,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phoneNumber,
      });
      setBusinessId(FALLBACK_BUSINESS_ID);
      setCurrencyState(FALLBACK_CURRENCY);
      setStatus("authenticated");
      return;
    }
    // Real API: register only — the caller must redirect to login
    await authApi.register(payload);
  }, []);

  const forgotPassword = useCallback<AuthContextValue["forgotPassword"]>(async (payload) => {
    if (!isApiConfigured()) return;
    await authApi.forgotPassword(payload);
  }, []);

  const logout = useCallback<AuthContextValue["logout"]>(async () => {
    const refreshToken = authStorage.getRefreshToken();
    if (isApiConfigured() && refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // ignore — clear locally regardless
      }
    }
    authStorage.clear();
    setSession(null);
    setUser(null);
    setBusinessId(null);
    setCurrencyState(null);
    setStatus("unauthenticated");
  }, []);

  const setCurrency = useCallback((code: string) => {
    authStorage.setCurrency(code);
    setCurrencyState(code);
  }, []);

  const createBusiness = useCallback<AuthContextValue["createBusiness"]>(
    async ({ name, industry, currency: cur }) => {
      if (!isApiConfigured()) return;
      const userId = user?.id ?? authStorage.getUserId();
      if (!userId) throw new Error("Not authenticated");
      const res = await businessApi.create({ name, industry, currency: cur, ownerId: userId });
      authStorage.setBusinessId(res.id);
      authStorage.setCurrency(cur);
      setBusinessId(res.id);
      setCurrencyState(cur);
    },
    [user?.id],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      session,
      permissions: session?.permissions ?? [],
      businessId,
      currency,
      setCurrency,
      login,
      register,
      forgotPassword,
      logout,
      createBusiness,
    }),
    [status, user, session, businessId, currency, setCurrency, login, register, forgotPassword, logout, createBusiness],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
