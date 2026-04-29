interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: "1",
    title: "أنشئ حسابك",
    description: "سجل مجاناً في ثوانٍ معدودة وابدأ في إعداد ملفك الشخصي كعامل حر.",
  },
  {
    number: "2",
    title: "أضف عملائك ومشاريعك",
    description: "نظم بيانات العملاء والمشاريع الحالية، وحدد أسعارك وساعات عملك.",
  },
  {
    number: "3",
    title: "ابدأ في إصدار الفواتير",
    description: "تتبع وقتك، أصدر الفواتير بنقرة واحدة، واستقبل مدفوعاتك بشكل أسرع.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#F8F9FA] relative z-10 border-t border-[#E6E6E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">كيف تعمل المنصة؟</h2>
          <p className="text-lg text-slate-600">ثلاث خطوات بسيطة للبدء في إدارة أعمالك باحترافية</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-blue-200 to-transparent z-0" />

          {STEPS.map((step) => (
            <div key={step.number} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-blue-50 flex items-center justify-center text-3xl font-bold text-[#0052FC] shadow-xl shadow-blue-900/5 mb-6">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
