"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";

type AuthMode = "login" | "register" | "forgot-password" | "forgot-success";

interface LoginScreenProps {
  onLogin: () => void;
  initialMode?: AuthMode;
}

export function LoginScreen({ onLogin, initialMode = "login" }: LoginScreenProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        // Simulate API /api/v1/auth/login
        await new Promise((res) => setTimeout(res, 800));
        localStorage.setItem("token", "dummy_token");
        onLogin();
      } else if (mode === "register") {
        // Simulate API /api/v1/auth/register
        await new Promise((res) => setTimeout(res, 800));
        // Auto-login
        localStorage.setItem("token", "dummy_token");
        onLogin();
      } else if (mode === "forgot-password") {
        // Simulate forgot password
        await new Promise((res) => setTimeout(res, 800));
        setMode("forgot-success");
      }
    } catch (err) {
      console.error(err);
      onLogin(); // Fallback for preview
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <Logo className="w-14 h-14" />
          </div>
          <div className="flex items-center gap-3 font-semibold text-[#0052FC]">
            <span className="text-3xl font-bold tracking-tight font-[family-name:var(--font-inter)]">Freelr</span>
          </div>
        </div>

        <div className="relative w-full rounded-[24px] border border-[#E6E6E6] bg-white p-8 shadow-sm">
          {mode === "login" && (
            <>
              <div className="mb-8 flex flex-col items-center gap-1">
                <h2 className="text-[24px] font-bold leading-[32px] text-black/90">مرحباً بعودتك!</h2>
                <p className="text-center text-[14px] font-normal leading-[20px] text-[#606060]">أدخل بياناتك للبدء</p>
              </div>
              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">البريد الإلكتروني</label>
                  <input
                    className="w-full rounded-md border py-2 outline-none ring-slate-200 focus:ring h-[44px] border-dashed border-[#E6E6E6] bg-transparent px-4 text-sm text-black"
                    placeholder="البريد الإلكتروني"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">كلمة المرور</label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot-password")}
                      className="text-[12px] font-semibold text-[#0052FC]"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full rounded-md border px-3 py-2 outline-none ring-slate-200 focus:ring h-[44px] border-dashed border-[#E6E6E6] bg-transparent ps-4 pe-10 text-sm text-black"
                      placeholder="••••••••••••"
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-[#606060]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-[16px] w-[16px]" /> : <Eye className="h-[16px] w-[16px]" />}
                    </button>
                  </div>
                </div>
                <button
                  className="inline-flex items-center justify-center px-4 py-2 transition mt-2 h-[51px] w-full rounded-[14px] bg-[#121212] text-[16px] font-semibold text-white hover:bg-[#121212]/90 disabled:opacity-50"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تسجيل الدخول"}
                </button>
                <div className="mt-2 border-t border-[#3C4A42]/10 pt-6">
                  <p className="flex justify-center gap-1 text-[14px] text-[#606060]">
                    جديد على المنصة؟{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="font-semibold text-[#0052FC]"
                    >
                      إنشاء حساب
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}

          {mode === "register" && (
            <>
              <div className="mb-8 flex flex-col items-center gap-1">
                <h2 className="text-[24px] font-bold leading-[32px] text-black/90">إنشاء حساب جديد</h2>
                <p className="text-center text-[14px] font-normal leading-[20px] text-[#606060]">أدخل بياناتك للبدء</p>
              </div>
              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">الاسم الأول</label>
                    <input
                      className="w-full rounded-md border py-2 outline-none ring-slate-200 focus:ring h-[44px] border-dashed border-[#E6E6E6] bg-transparent px-4 text-sm text-black"
                      placeholder="الاسم الأول"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">اسم العائلة</label>
                    <input
                      className="w-full rounded-md border py-2 outline-none ring-slate-200 focus:ring h-[44px] border-dashed border-[#E6E6E6] bg-transparent px-4 text-sm text-black"
                      placeholder="اسم العائلة"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">رقم الهاتف</label>
                  <input
                    className="w-full rounded-md border py-2 outline-none ring-slate-200 focus:ring h-[44px] border-dashed border-[#E6E6E6] bg-transparent px-4 text-sm text-black"
                    placeholder="رقم الهاتف"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">البريد الإلكتروني</label>
                  <input
                    className="w-full rounded-md border py-2 outline-none ring-slate-200 focus:ring h-[44px] border-dashed border-[#E6E6E6] bg-transparent px-4 text-sm text-black"
                    placeholder="البريد الإلكتروني"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">كلمة المرور</label>
                  <div className="relative">
                    <input
                      className="w-full rounded-md border px-3 py-2 outline-none ring-slate-200 focus:ring h-[44px] border-dashed border-[#E6E6E6] bg-transparent ps-4 pe-10 text-sm text-black"
                      placeholder="••••••••••••"
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-[#606060]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-[16px] w-[16px]" /> : <Eye className="h-[16px] w-[16px]" />}
                    </button>
                  </div>
                </div>
                <button
                  className="inline-flex items-center justify-center px-4 py-2 transition mt-2 h-[51px] w-full rounded-[14px] bg-[#121212] text-[16px] font-semibold text-white hover:bg-[#121212]/90 disabled:opacity-50"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "إنشاء حساب"}
                </button>
                <div className="mt-2 border-t border-[#3C4A42]/10 pt-6">
                  <p className="flex justify-center gap-1 text-[14px] text-[#606060]">
                    تسجيل الدخول؟{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="font-semibold text-[#0052FC]"
                    >
                      تسجيل الدخول
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}

          {mode === "forgot-password" && (
            <>
              <div className="mb-8 flex flex-col items-center gap-1">
                <h2 className="text-[24px] font-bold leading-[32px] text-black/90">نسيت كلمة المرور</h2>
                <p className="text-center text-[14px] font-normal leading-[20px] text-[#606060]">
                  أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين
                </p>
              </div>
              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">البريد الإلكتروني</label>
                  <input
                    className="w-full rounded-md border py-2 outline-none ring-slate-200 focus:ring h-[44px] border-dashed border-[#E6E6E6] bg-transparent px-4 text-sm text-black"
                    placeholder="البريد الإلكتروني"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  className="inline-flex items-center justify-center px-4 py-2 transition mt-2 h-[51px] w-full rounded-[14px] bg-[#121212] text-[16px] font-semibold text-white hover:bg-[#121212]/90 disabled:opacity-50"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال رابط إعادة التعيين"}
                </button>
                <div className="mt-2 border-t border-[#3C4A42]/10 pt-6">
                  <div className="flex justify-center text-center">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="font-semibold text-[14px] text-[#0052FC]"
                    >
                      العودة لتسجيل الدخول
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}

          {mode === "forgot-success" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <p className="text-[14px] font-medium text-center text-green-600">
                تم إرسال تعليمات إعادة التعيين إلى بريدك الإلكتروني بنجاح!
              </p>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="mt-4 font-semibold text-[14px] text-[#0052FC]"
              >
                العودة إلى تسجيل الدخول
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
