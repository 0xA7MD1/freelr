"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/ui/logo";
import { LanguageSwitcher } from "@/components/shared/ui/language-switcher";
import { useT } from "@/lib/i18n";

export function LandingNav() {
  const t = useT();

  return (
    <nav className="w-full py-6 px-8 flex justify-between items-center z-50 border-b border-[#E6E6E6] bg-white/70 backdrop-blur-xl fixed top-0 left-0 right-0">
      <div className="flex items-center gap-3 font-semibold text-[#0052FC]">
        <Logo className="w-8 h-8" />
        <span className="text-xl font-bold tracking-tight">Freelr</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <a href="#features" className="hover:text-slate-900 transition-colors">{t("landing.nav.features")}</a>
        <a href="#how-it-works" className="hover:text-slate-900 transition-colors">{t("landing.nav.howItWorks")}</a>
        <a href="#pricing" className="hover:text-slate-900 transition-colors">{t("landing.nav.pricing")}</a>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-full bg-[#121212] text-white text-[14px] font-semibold hover:bg-black transition-all shadow-sm shadow-black/5 hover:-translate-y-0.5"
        >
          {t("landing.nav.login")}
        </Link>
      </div>
    </nav>
  );
}
