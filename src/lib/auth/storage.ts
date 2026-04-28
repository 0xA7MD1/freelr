const TOKEN_KEY = "freelr.token";
const REFRESH_KEY = "freelr.refresh";
const EXPIRES_KEY = "freelr.expiresAt";
const PERMISSIONS_KEY = "freelr.permissions";
const REMEMBER_KEY = "freelr.remember";
const USER_ID_KEY = "freelr.userId";
const BUSINESS_ID_KEY = "freelr.businessId";
const CURRENCY_KEY = "freelr.currency";

interface SessionInput {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  permissions?: string[];
  remember?: boolean;
}

function getStore(remember?: boolean): Storage | null {
  if (typeof window === "undefined") return null;
  if (remember === undefined) {
    return window.localStorage.getItem(REMEMBER_KEY) === "1"
      ? window.localStorage
      : window.sessionStorage;
  }
  return remember ? window.localStorage : window.sessionStorage;
}

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);
}

export const authStorage = {
  getToken(): string | null {
    return read(TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return read(REFRESH_KEY);
  },

  getExpiresAt(): string | null {
    return read(EXPIRES_KEY);
  },

  getPermissions(): string[] {
    const raw = read(PERMISSIONS_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    } catch {
      return [];
    }
  },

  getUserId(): string | null {
    return read(USER_ID_KEY);
  },

  setUserId(id: string): void {
    const store = getStore();
    if (!store) return;
    store.setItem(USER_ID_KEY, id);
  },

  getBusinessId(): string | null {
    return read(BUSINESS_ID_KEY);
  },

  setBusinessId(id: string): void {
    const store = getStore();
    if (!store) return;
    store.setItem(BUSINESS_ID_KEY, id);
  },

  getCurrency(): string | null {
    return read(CURRENCY_KEY);
  },

  setCurrency(code: string): void {
    const store = getStore();
    if (!store) return;
    store.setItem(CURRENCY_KEY, code);
  },

  setSession(input: SessionInput) {
    const { token, refreshToken, expiresAt, permissions, remember = false } = input;
    const store = getStore(remember);
    if (!store) return;
    store.setItem(TOKEN_KEY, token);
    if (refreshToken) store.setItem(REFRESH_KEY, refreshToken);
    if (expiresAt) store.setItem(EXPIRES_KEY, expiresAt);
    if (permissions) store.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
    if (remember) window.localStorage.setItem(REMEMBER_KEY, "1");
    else window.localStorage.removeItem(REMEMBER_KEY);
  },

  clear() {
    if (typeof window === "undefined") return;
    [window.localStorage, window.sessionStorage].forEach((s) => {
      s.removeItem(TOKEN_KEY);
      s.removeItem(REFRESH_KEY);
      s.removeItem(EXPIRES_KEY);
      s.removeItem(PERMISSIONS_KEY);
      s.removeItem(USER_ID_KEY);
      s.removeItem(BUSINESS_ID_KEY);
      s.removeItem(CURRENCY_KEY);
    });
    window.localStorage.removeItem(REMEMBER_KEY);
  },
};
