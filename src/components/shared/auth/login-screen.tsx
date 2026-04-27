"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Logo } from "@/components/shared/ui/logo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError } from "@/lib/api/client";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  type ForgotPasswordValues,
  type LoginValues,
  type RegisterValues,
} from "@/lib/validations/auth";

type AuthMode = "login" | "register" | "forgot-password" | "forgot-success";

interface LoginScreenProps {
  onLogin: () => void;
  initialMode?: AuthMode;
}

const fieldClass =
  "w-full rounded-md border py-2 outline-none ring-slate-200 focus:ring h-[44px] border-dashed border-[#E6E6E6] bg-transparent px-4 text-sm text-black";

const fieldErrorClass = "text-[12px] text-destructive mt-1";

export function LoginScreen({ onLogin, initialMode = "login" }: LoginScreenProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, forgotPassword } = useAuth();

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
            <LoginForm
              onSubmit={async (values) => {
                try {
                  await login(values);
                  onLogin();
                } catch (err) {
                  toast.error(
                    err instanceof ApiError
                      ? err.message
                      : "تعذر تسجيل الدخول. تحقق من بياناتك وحاول مجدداً.",
                  );
                }
              }}
              onForgot={() => setMode("forgot-password")}
              onSwitchToRegister={() => setMode("register")}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}

          {mode === "register" && (
            <RegisterForm
              onSubmit={async (values) => {
                try {
                  await register(values);
                  onLogin();
                } catch (err) {
                  toast.error(
                    err instanceof ApiError
                      ? err.message
                      : "تعذر إنشاء الحساب. حاول مرة أخرى.",
                  );
                }
              }}
              onSwitchToLogin={() => setMode("login")}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}

          {mode === "forgot-password" && (
            <ForgotForm
              onSubmit={async (values) => {
                try {
                  await forgotPassword(values);
                  setMode("forgot-success");
                } catch (err) {
                  toast.error(
                    err instanceof ApiError
                      ? err.message
                      : "حدث خطأ أثناء إرسال الرابط. حاول مرة أخرى.",
                  );
                }
              }}
              onBack={() => setMode("login")}
            />
          )}

          {mode === "forgot-success" && <ForgotSuccess onBack={() => setMode("login")} />}
        </div>
      </div>
    </div>
  );
}

interface LoginFormProps {
  onSubmit: (values: LoginValues) => Promise<void>;
  onForgot: () => void;
  onSwitchToRegister: () => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
}

function LoginForm({ onSubmit, onForgot, onSwitchToRegister, showPassword, setShowPassword }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  return (
    <>
      <div className="mb-8 flex flex-col items-center gap-1">
        <h2 className="text-[24px] font-bold leading-[32px] text-black/90">مرحباً بعودتك!</h2>
        <p className="text-center text-[14px] font-normal leading-[20px] text-[#606060]">أدخل بياناتك للبدء</p>
      </div>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">البريد الإلكتروني</label>
          <input
            className={fieldClass}
            placeholder="البريد الإلكتروني"
            type="email"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && <p className={fieldErrorClass}>{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">كلمة المرور</label>
            <button type="button" onClick={onForgot} className="text-[12px] font-semibold text-[#0052FC]">
              نسيت كلمة المرور؟
            </button>
          </div>
          <div className="relative">
            <input
              className="w-full rounded-md border px-3 py-2 outline-none ring-slate-200 focus:ring h-[44px] border-dashed border-[#E6E6E6] bg-transparent ps-4 pe-10 text-sm text-black"
              placeholder="••••••••••••"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[#606060]"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? <EyeOff className="h-[16px] w-[16px]" /> : <Eye className="h-[16px] w-[16px]" />}
            </button>
          </div>
          {errors.password && <p className={fieldErrorClass}>{errors.password.message}</p>}
        </div>
        <label className="flex items-center gap-2 text-[13px] text-[#606060] cursor-pointer select-none">
          <input type="checkbox" className="accent-[#0052FC]" {...register("remember")} />
          تذكرني على هذا الجهاز
        </label>
        <button
          className="inline-flex items-center justify-center px-4 py-2 transition mt-2 h-[51px] w-full rounded-[14px] bg-[#121212] text-[16px] font-semibold text-white hover:bg-[#121212]/90 disabled:opacity-50"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "تسجيل الدخول"}
        </button>
        <div className="mt-2 border-t border-[#3C4A42]/10 pt-6">
          <p className="flex justify-center gap-1 text-[14px] text-[#606060]">
            جديد على المنصة؟{" "}
            <button type="button" onClick={onSwitchToRegister} className="font-semibold text-[#0052FC]">
              إنشاء حساب
            </button>
          </p>
        </div>
      </form>
    </>
  );
}

interface RegisterFormProps {
  onSubmit: (values: RegisterValues) => Promise<void>;
  onSwitchToLogin: () => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
}

function RegisterForm({ onSubmit, onSwitchToLogin, showPassword, setShowPassword }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phoneNumber: "", password: "" },
  });

  return (
    <>
      <div className="mb-8 flex flex-col items-center gap-1">
        <h2 className="text-[24px] font-bold leading-[32px] text-black/90">إنشاء حساب جديد</h2>
        <p className="text-center text-[14px] font-normal leading-[20px] text-[#606060]">أدخل بياناتك للبدء</p>
      </div>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">الاسم الأول</label>
            <input className={fieldClass} placeholder="الاسم الأول" autoComplete="given-name" {...register("firstName")} />
            {errors.firstName && <p className={fieldErrorClass}>{errors.firstName.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">اسم العائلة</label>
            <input className={fieldClass} placeholder="اسم العائلة" autoComplete="family-name" {...register("lastName")} />
            {errors.lastName && <p className={fieldErrorClass}>{errors.lastName.message}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">رقم الهاتف</label>
          <input
            className={fieldClass}
            placeholder="رقم الهاتف"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && <p className={fieldErrorClass}>{errors.phoneNumber.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">البريد الإلكتروني</label>
          <input className={fieldClass} placeholder="البريد الإلكتروني" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className={fieldErrorClass}>{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">كلمة المرور</label>
          <div className="relative">
            <input
              className="w-full rounded-md border px-3 py-2 outline-none ring-slate-200 focus:ring h-[44px] border-dashed border-[#E6E6E6] bg-transparent ps-4 pe-10 text-sm text-black"
              placeholder="••••••••••••"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[#606060]"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? <EyeOff className="h-[16px] w-[16px]" /> : <Eye className="h-[16px] w-[16px]" />}
            </button>
          </div>
          {errors.password && <p className={fieldErrorClass}>{errors.password.message}</p>}
        </div>
        <button
          className="inline-flex items-center justify-center px-4 py-2 transition mt-2 h-[51px] w-full rounded-[14px] bg-[#121212] text-[16px] font-semibold text-white hover:bg-[#121212]/90 disabled:opacity-50"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "إنشاء حساب"}
        </button>
        <div className="mt-2 border-t border-[#3C4A42]/10 pt-6">
          <p className="flex justify-center gap-1 text-[14px] text-[#606060]">
            تسجيل الدخول؟{" "}
            <button type="button" onClick={onSwitchToLogin} className="font-semibold text-[#0052FC]">
              تسجيل الدخول
            </button>
          </p>
        </div>
      </form>
    </>
  );
}

interface ForgotFormProps {
  onSubmit: (values: ForgotPasswordValues) => Promise<void>;
  onBack: () => void;
}

function ForgotForm({ onSubmit, onBack }: ForgotFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <>
      <div className="mb-8 flex flex-col items-center gap-1">
        <h2 className="text-[24px] font-bold leading-[32px] text-black/90">نسيت كلمة المرور</h2>
        <p className="text-center text-[14px] font-normal leading-[20px] text-[#606060]">
          أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين
        </p>
      </div>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">البريد الإلكتروني</label>
          <input className={fieldClass} placeholder="البريد الإلكتروني" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className={fieldErrorClass}>{errors.email.message}</p>}
        </div>
        <button
          className="inline-flex items-center justify-center px-4 py-2 transition mt-2 h-[51px] w-full rounded-[14px] bg-[#121212] text-[16px] font-semibold text-white hover:bg-[#121212]/90 disabled:opacity-50"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال رابط إعادة التعيين"}
        </button>
        <div className="mt-2 border-t border-[#3C4A42]/10 pt-6">
          <div className="flex justify-center text-center">
            <button type="button" onClick={onBack} className="font-semibold text-[14px] text-[#0052FC]">
              العودة لتسجيل الدخول
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

function ForgotSuccess({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <p className="text-[14px] font-medium text-center text-green-600">
        تم إرسال تعليمات إعادة التعيين إلى بريدك الإلكتروني بنجاح!
      </p>
      <button type="button" onClick={onBack} className="mt-4 font-semibold text-[14px] text-[#0052FC]">
        العودة إلى تسجيل الدخول
      </button>
    </div>
  );
}



