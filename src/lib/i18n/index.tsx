"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ar } from "./ar";
import { en } from "./en";

export type Locale = "ar" | "en";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const TRANSLATIONS = { ar, en } as const;

type Translations = typeof ar;

function resolvePath(obj: unknown, path: string): string {
  const result = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
  return typeof result === "string" ? result : path;
}

function t(locale: Locale, path: string, params?: Record<string, string | number>): string {
  let value = resolvePath(TRANSLATIONS[locale], path);
  if (value === path) value = resolvePath(TRANSLATIONS.ar, path); // fallback to Arabic
  if (params) {
    return Object.entries(params).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), value);
  }
  return value;
}

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "ar",
  setLocale: () => {},
  t: (path) => path,
  isRTL: true,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("freelr-locale") as Locale | null;
    if (saved === "ar" || saved === "en") {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    const isRTL = locale === "ar";
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    localStorage.setItem("freelr-locale", locale);
  }, [locale]);

  const setLocale = (l: Locale) => setLocaleState(l);
  const translate = (path: string, params?: Record<string, string | number>) => t(locale, path, params);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translate, isRTL: locale === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  const { t } = useContext(LanguageContext);
  return t;
}
