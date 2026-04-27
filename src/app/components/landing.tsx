import Link from "next/link";
import { Logo } from "@/components/shared/ui/logo";

export function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <nav className="w-full py-6 px-8 flex justify-between items-center z-10 border-b border-[#E6E6E6]/50 bg-white/50 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3 font-semibold text-[#0052FC]">
          <Logo className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight font-[family-name:var(--font-inter)]">Freelr</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-6 py-2 rounded-[14px] bg-[#121212] text-white text-[14px] font-semibold hover:bg-[#121212]/90 transition"
          >
            تسجيل الدخول
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center z-10 py-20">
        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 border border-blue-100 text-blue-600">
          <Logo className="w-12 h-12" />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 max-w-3xl leading-[1.3]">
          نظّم أعمالك كعامل حر بكل سهولة واحترافية
        </h1>

        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
          منصة متكاملة لإدارة مشاريعك، تتبع وقتك، وإصدار الفواتير. كل ما تحتاجه للنجاح كمنشئ محتوى أو مبرمج في مكان واحد.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 rounded-[16px] bg-[#0052FC] text-white text-[16px] font-bold hover:bg-[#0040C0] transition shadow-lg shadow-blue-500/20 w-full sm:w-auto"
          >
            جرب الآن مجاناً
          </Link>
        </div>

        <div className="mt-20 relative w-full max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="rounded-[24px] border border-[#E6E6E6] bg-white p-2 shadow-2xl overflow-hidden aspect-[16/9] rotate-[1deg] hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-full bg-[#fcfcfc] rounded-[20px] border border-slate-100 p-6 flex flex-col gap-6 overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#E6E6E6] pb-4">
                <div className="w-32 h-8 bg-slate-200 rounded-md animate-pulse" />
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    ع
                  </div>
                </div>
              </div>

              <div className="flex-1 flex gap-6">
                <div className="w-48 flex-col gap-4 hidden sm:flex">
                  <div className="w-full h-10 bg-blue-50 rounded-lg animate-pulse" />
                  <div className="w-full h-10 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="w-full h-10 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="w-full h-10 bg-slate-100 rounded-lg animate-pulse" />
                </div>

                <div className="flex-1 flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="h-28 bg-white border border-[#E6E6E6] rounded-xl shadow-sm p-4 flex flex-col justify-between">
                      <div className="w-12 h-4 bg-slate-200 rounded animate-pulse" />
                      <div className="w-24 h-8 bg-green-100 rounded animate-pulse" />
                    </div>
                    <div className="h-28 bg-white border border-[#E6E6E6] rounded-xl shadow-sm p-4 flex flex-col justify-between">
                      <div className="w-12 h-4 bg-slate-200 rounded animate-pulse" />
                      <div className="w-24 h-8 bg-blue-100 rounded animate-pulse" />
                    </div>
                    <div className="h-28 bg-white border border-[#E6E6E6] rounded-xl shadow-sm p-4 flex flex-col justify-between">
                      <div className="w-12 h-4 bg-slate-200 rounded animate-pulse" />
                      <div className="w-24 h-8 bg-purple-100 rounded animate-pulse" />
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-6">
                    <div className="col-span-2 bg-white border border-[#E6E6E6] rounded-xl shadow-sm p-4 flex flex-col gap-4">
                      <div className="w-32 h-5 bg-slate-200 rounded animate-pulse" />
                      <div className="flex-1 border-t border-slate-100 pt-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                          <div className="w-40 h-4 bg-slate-200 rounded animate-pulse" />
                          <div className="w-16 h-4 bg-green-200 rounded animate-pulse" />
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                          <div className="w-48 h-4 bg-slate-200 rounded animate-pulse" />
                          <div className="w-16 h-4 bg-yellow-200 rounded animate-pulse" />
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                          <div className="w-36 h-4 bg-slate-200 rounded animate-pulse" />
                          <div className="w-16 h-4 bg-blue-200 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1 bg-white border border-[#E6E6E6] rounded-xl shadow-sm p-4 flex flex-col gap-4">
                      <div className="w-24 h-5 bg-slate-200 rounded animate-pulse" />
                      <div className="flex-1 border-t border-slate-100 pt-4 flex flex-col gap-4 items-center justify-center">
                        <div className="w-32 h-32 rounded-full border-8 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-purple-500 animate-[spin_4s_linear_infinite] opacity-50" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/5 blur-[100px] pointer-events-none" />
    </div>
  );
}



