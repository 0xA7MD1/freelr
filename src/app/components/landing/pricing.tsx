"use client";

import Link from "next/link";
import { Check, CheckCircle2 } from "lucide-react";
import { useT } from "@/lib/i18n";

export function LandingPricing() {
  const t = useT();

  return (
    <section id="pricing" className="py-24 bg-white relative z-10 border-t border-[#E6E6E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("landing.pricing.title")}</h2>
          <p className="text-lg text-slate-600">{t("landing.pricing.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <FreePlanCard />
          <ProPlanCard />
        </div>
      </div>
    </section>
  );
}

function FreePlanCard() {
  const t = useT();

  const features = [
    { key: "landing.pricing.free.feature1", included: true },
    { key: "landing.pricing.free.feature2", included: true },
    { key: "landing.pricing.free.feature3", included: true },
    { key: "landing.pricing.free.feature4", included: false },
    { key: "landing.pricing.free.feature5", included: false },
  ];

  return (
    <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:border-slate-300">
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{t("landing.pricing.free.name")}</h3>
      <p className="text-slate-500 mb-6">{t("landing.pricing.free.tagline")}</p>
      <div className="mb-8">
        <span className="text-5xl font-bold text-slate-900">{t("landing.pricing.free.price")}</span>
      </div>
      <ul className="flex flex-col gap-4 mb-8 flex-1">
        {features.map((f) => (
          <li
            key={f.key}
            className={`flex items-center gap-3 ${f.included ? "text-slate-700" : "text-slate-400"}`}
          >
            <Check className={`w-5 h-5 shrink-0 ${f.included ? "text-green-500" : "text-slate-300"}`} />
            <span className={f.included ? "font-medium" : ""}>{t(f.key)}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className="w-full block text-center py-4 rounded-2xl bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-colors"
      >
        {t("landing.pricing.free.cta")}
      </Link>
    </div>
  );
}

function ProPlanCard() {
  const t = useT();

  const proFeatures = [
    "landing.pricing.pro.feature1",
    "landing.pricing.pro.feature2",
    "landing.pricing.pro.feature3",
    "landing.pricing.pro.feature4",
    "landing.pricing.pro.feature5",
  ];

  return (
    <div className="bg-[#0052FC] rounded-[32px] p-8 border border-[#0052FC] shadow-xl flex flex-col relative overflow-hidden transform md:-translate-y-4 select-none">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-md z-10 flex flex-col items-center justify-center">
        <div className="bg-white/90 text-[#0052FC] px-6 py-3 rounded-2xl font-bold border border-white/50 shadow-lg text-lg transform -rotate-2">
          {t("landing.pricing.pro.comingSoon")}
        </div>
        <p className="text-white font-medium mt-4 bg-black/20 px-4 py-1.5 rounded-full text-sm backdrop-blur-sm">
          {t("landing.pricing.pro.workingOnFeatures")}
        </p>
      </div>

      <div className="opacity-50 blur-[2px]">
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-bl-[16px]">
          {t("landing.pricing.pro.popular")}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{t("landing.pricing.pro.name")}</h3>
        <p className="text-blue-200 mb-6">{t("landing.pricing.pro.tagline")}</p>
        <div className="mb-8">
          <span className="text-5xl font-bold text-white">
            <span className="text-3xl">$</span>15
          </span>
          <span className="text-blue-200">{t("landing.pricing.pro.perMonth")}</span>
        </div>
        <ul className="flex flex-col gap-4 mb-8 flex-1">
          {proFeatures.map((key) => (
            <li key={key} className="flex items-center gap-3 text-white">
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              <span className="font-medium">{t(key)}</span>
            </li>
          ))}
        </ul>
        <div className="w-full block text-center py-4 rounded-2xl bg-white text-[#0052FC] font-bold">
          {t("landing.pricing.pro.cta")}
        </div>
      </div>
    </div>
  );
}
