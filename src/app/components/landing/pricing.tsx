import Link from "next/link";
import { Check, CheckCircle2 } from "lucide-react";

const FREE_FEATURES = [
  { text: "إدارة 3 مشاريع نشطة", included: true },
  { text: "إصدار 10 فواتير شهرياً", included: true },
  { text: "تتبع الوقت الأساسي", included: true },
  { text: "تقارير مالية متقدمة", included: false },
  { text: "دعم فني ذو أولوية", included: false },
];

const PRO_FEATURES = [
  "مشاريع لامحدودة",
  "فواتير لامحدودة",
  "تتبع الوقت والجهد الاحترافي",
  "تقارير مالية وتصدير PDF",
  "دعم فني ذو أولوية",
];

export function LandingPricing() {
  return (
    <section id="pricing" className="py-24 bg-white relative z-10 border-t border-[#E6E6E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">باقات تناسب أعمالك</h2>
          <p className="text-lg text-slate-600">اختر الباقة المناسبة لاحتياجاتك وابدأ في تطوير عملك الحر</p>
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
  return (
    <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:border-slate-300">
      <h3 className="text-2xl font-bold text-slate-900 mb-2">الباقة الأساسية</h3>
      <p className="text-slate-500 mb-6">مثالية للمستقلين المبتدئين</p>
      <div className="mb-8">
        <span className="text-5xl font-bold text-slate-900">مجاناً</span>
      </div>
      <ul className="flex flex-col gap-4 mb-8 flex-1">
        {FREE_FEATURES.map((feature) => (
          <li
            key={feature.text}
            className={`flex items-center gap-3 ${feature.included ? "text-slate-700" : "text-slate-400"}`}
          >
            <Check className={`w-5 h-5 shrink-0 ${feature.included ? "text-green-500" : "text-slate-300"}`} />
            <span className={feature.included ? "font-medium" : ""}>{feature.text}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className="w-full block text-center py-4 rounded-2xl bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-colors"
      >
        ابدأ مجاناً
      </Link>
    </div>
  );
}

function ProPlanCard() {
  return (
    <div className="bg-[#0052FC] rounded-[32px] p-8 border border-[#0052FC] shadow-xl flex flex-col relative overflow-hidden transform md:-translate-y-4 select-none">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-md z-10 flex flex-col items-center justify-center">
        <div className="bg-white/90 text-[#0052FC] px-6 py-3 rounded-2xl font-bold border border-white/50 shadow-lg text-lg transform -rotate-2">
          قريباً
        </div>
        <p className="text-white font-medium mt-4 bg-black/20 px-4 py-1.5 rounded-full text-sm backdrop-blur-sm">
          نعمل على إضافة المزيد من الميزات!
        </p>
      </div>

      <div className="opacity-50 blur-[2px]">
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-bl-[16px]">
          الأكثر شعبية
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">باقة المحترفين</h3>
        <p className="text-blue-200 mb-6">للمستقلين أصحاب الأعمال المتنامية</p>
        <div className="mb-8">
          <span className="text-5xl font-bold text-white">
            <span className="text-3xl">$</span>15
          </span>
          <span className="text-blue-200">/ شهرياً</span>
        </div>
        <ul className="flex flex-col gap-4 mb-8 flex-1">
          {PRO_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-white">
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              <span className="font-medium">{feature}</span>
            </li>
          ))}
        </ul>
        <div className="w-full block text-center py-4 rounded-2xl bg-white text-[#0052FC] font-bold">
          اشترك الآن
        </div>
      </div>
    </div>
  );
}
