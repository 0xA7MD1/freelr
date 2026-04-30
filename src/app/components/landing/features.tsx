"use client";

import { LineChart, Users, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useT } from "@/lib/i18n";

interface FeatureCard {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  titleKey: string;
  descKey: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: LineChart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    titleKey: "landing.features.financial.title",
    descKey: "landing.features.financial.description",
  },
  {
    icon: Zap,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    titleKey: "landing.features.invoicesFeature.title",
    descKey: "landing.features.invoicesFeature.description",
  },
  {
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    titleKey: "landing.features.clientsFeature.title",
    descKey: "landing.features.clientsFeature.description",
  },
];

export function LandingFeatures() {
  const t = useT();

  return (
    <section id="features" className="py-24 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t("landing.features.title")}
          </h2>
          <p className="text-lg text-slate-600">{t("landing.features.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <FeatureCardItem key={feature.titleKey} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCardItem({ icon: Icon, iconBg, iconColor, titleKey, descKey }: FeatureCard) {
  const t = useT();

  return (
    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center ${iconColor} mb-6`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{t(titleKey)}</h3>
      <p className="text-slate-600 leading-relaxed">{t(descKey)}</p>
    </div>
  );
}
