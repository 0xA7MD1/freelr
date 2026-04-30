"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, LineChart } from "lucide-react";
import { useT } from "@/lib/i18n";

export function LandingHero() {
  const t = useT();

  return (
    <main className="flex-grow flex flex-col items-center px-4 text-center z-10 pt-24 pb-16">
      <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100/50">
        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
        <span className="text-sm font-medium text-blue-800">{t("landing.hero.badge")}</span>
      </div>

      <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 max-w-4xl leading-[1.1] tracking-tight">
        {t("landing.hero.title")} <span className="text-[#0052FC]">{t("landing.hero.titleHighlight")}</span>
      </h1>

      <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl leading-relaxed">
        {t("landing.hero.description")}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-[#0052FC] text-white text-[16px] font-bold hover:bg-[#0040C0] transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-1 w-full sm:w-auto"
        >
          {t("landing.hero.ctaPrimary")}
        </Link>
        <a
          href="#explore"
          className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-white text-slate-700 border border-slate-200 text-[16px] font-bold hover:bg-slate-50 transition-all hover:-translate-y-1 w-full sm:w-auto"
        >
          {t("landing.hero.ctaSecondary")}
          <ArrowLeft className="w-5 h-5 rtl:hidden" />
        </a>
      </div>

      <DashboardPreview />
    </main>
  );
}

function DashboardPreview() {
  const t = useT();

  return (
    <div id="explore" className="mt-16 sm:mt-24 relative w-full max-w-[1000px] flex justify-center perspective-[2000px] px-4 sm:px-8">
      <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FA] via-transparent to-transparent z-20 pointer-events-none rounded-b-[32px] h-[150%] -top-[50%]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative w-full h-[400px] sm:h-[480px] z-10 flex justify-center mt-8">
        {/* Main Chart Card */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-full max-w-[700px] bg-white/70 backdrop-blur-2xl border border-white/80 p-5 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05),0_0_20px_rgba(0,82,252,0.05)] flex flex-col gap-4 sm:gap-6 z-10 transform-gpu hover:scale-[1.01] transition-transform duration-500">
          <div className="flex justify-between items-start sm:items-center border-b border-slate-100/80 pb-4 sm:pb-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100/50">
                <LineChart className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-slate-800">{t("landing.hero.totalEarnings")}</div>
                <div className="text-xs sm:text-sm text-slate-500 mt-0.5">{t("landing.hero.thisMonth")}</div>
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-700 mt-1 sm:mt-0">$4,850</div>
          </div>

          <div className="flex-1 flex items-end gap-1.5 sm:gap-3 h-[180px] sm:h-[220px]">
            {[30, 45, 25, 60, 40, 80, 55, 90, 75, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-slate-100/50 rounded-t-lg sm:rounded-t-xl relative overflow-hidden group h-full">
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-[#0052FC] to-[#4080FF] rounded-t-lg sm:rounded-t-xl transition-all duration-700 ease-out group-hover:from-blue-600 group-hover:to-blue-400 group-hover:scale-y-[1.05] origin-bottom shadow-[0_0_10px_rgba(0,0,0,0)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Floating Card 1 - Invoice */}
        <div className="absolute right-0 sm:right-[-4%] top-[-8%] sm:top-[5%] w-[85%] max-w-[280px] bg-white/90 backdrop-blur-xl border border-white/80 p-4 sm:p-5 rounded-[24px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] z-20 hover:-translate-y-2 hover:shadow-[0_30px_50px_-10px_rgba(0,0,0,0.12)] transition-all duration-500 cursor-default animate-[floating_4s_ease-in-out_infinite_alternate]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-50 to-green-100/50 border border-green-100 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">{t("landing.hero.paidInvoice")}</div>
              <div className="text-xs text-slate-500">{t("landing.hero.minutesAgo")}</div>
            </div>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
            <span className="text-sm font-medium text-slate-600 line-clamp-1 flex-1 text-right ml-2 leading-none">{t("landing.hero.company")}</span>
            <span className="text-sm font-bold text-green-600 shrink-0 bg-green-50 px-2 py-1 rounded-lg">+$1,200</span>
          </div>
        </div>

        {/* Floating Card 2 - Task */}
        <div className="absolute left-0 sm:left-[-4%] bottom-[-8%] sm:bottom-[10%] w-[85%] max-w-[280px] bg-white/90 backdrop-blur-xl border border-white/80 p-4 sm:p-5 rounded-[24px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] z-20 hover:-translate-y-2 hover:shadow-[0_30px_50px_-10px_rgba(0,0,0,0.12)] transition-all duration-500 cursor-default animate-[floating_5s_ease-in-out_infinite_alternate-reverse]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-800">{t("landing.hero.upcomingTasks")}</span>
            <span className="text-[10px] sm:text-xs bg-orange-50 border border-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-bold tracking-tight">{t("landing.hero.tasks")}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#0052FC] to-[#4080FF] shadow-sm shrink-0" />
              <span className="text-xs sm:text-sm text-slate-600 font-medium truncate">{t("landing.hero.taskDesign")}</span>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 shadow-sm shrink-0" />
              <span className="text-xs sm:text-sm text-slate-600 font-medium truncate">{t("landing.hero.taskDev")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
