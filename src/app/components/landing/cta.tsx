"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

export function LandingCta() {
  const t = useT();

  return (
    <section className="py-20 bg-[#0052FC] relative z-10 overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t("landing.cta.title")}</h2>
        <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          {t("landing.cta.description")}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-white text-[#0052FC] text-[16px] font-bold hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-1"
        >
          {t("landing.cta.button")}
        </Link>
      </div>
    </section>
  );
}
