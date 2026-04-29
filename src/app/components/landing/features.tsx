import { LineChart, Users, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FeatureCard {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: LineChart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "تتبع مالي دقيق",
    description:
      "راقب إيراداتك ومصروفاتك بكل سهولة. تقارير مفصلة تساعدك على فهم وضعك المالي واتخاذ قرارات أفضل.",
  },
  {
    icon: Zap,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "فواتير احترافية بضغطة",
    description:
      "أنشئ وأرسل فواتير احترافية لعملائك في ثوانٍ. تتبع حالة الدفع وأرسل تذكيرات تلقائية.",
  },
  {
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "إدارة العملاء والمشاريع",
    description:
      "نظم بيانات عملائك ومشاريعك في مكان واحد. خطط للمهام وتتبع التقدم بسهولة.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            كل ما تحتاجه لإدارة أعمالك الحرة
          </h2>
          <p className="text-lg text-slate-600">أدوات مصممة خصيصاً لتوفير وقتك وزيادة إنتاجيتك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <FeatureCardItem key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCardItem({ icon: Icon, iconBg, iconColor, title, description }: FeatureCard) {
  return (
    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center ${iconColor} mb-6`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
