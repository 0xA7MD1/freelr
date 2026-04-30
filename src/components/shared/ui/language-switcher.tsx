"use client";

import { useLanguage } from "@/lib/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${className ?? ""}`}
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <span className="text-sm leading-none">{locale === "ar" ? "🇬🇧" : "🇸🇦"}</span>
      <span>{locale === "ar" ? "EN" : "عربي"}</span>
    </button>
  );
}
