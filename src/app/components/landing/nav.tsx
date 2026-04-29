import Link from "next/link";
import { Logo } from "@/components/shared/ui/logo";

export function LandingNav() {
  return (
    <nav className="w-full py-6 px-8 flex justify-between items-center z-50 border-b border-[#E6E6E6] bg-white/70 backdrop-blur-xl sticky top-0">
      <div className="flex items-center gap-3 font-semibold text-[#0052FC]">
        <Logo className="w-8 h-8" />
        <span className="text-xl font-bold tracking-tight">Freelr</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <a href="#features" className="hover:text-slate-900 transition-colors">المميزات</a>
        <a href="#how-it-works" className="hover:text-slate-900 transition-colors">كيف يعمل؟</a>
        <a href="#pricing" className="hover:text-slate-900 transition-colors">الأسعار</a>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-full bg-[#121212] text-white text-[14px] font-semibold hover:bg-black transition-all shadow-sm shadow-black/5 hover:-translate-y-0.5"
        >
          تسجيل الدخول
        </Link>
      </div>
    </nav>
  );
}
