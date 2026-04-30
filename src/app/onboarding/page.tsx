"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/ui/logo";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError } from "@/lib/api/client";
import { LanguageSwitcher } from "@/components/shared/ui/language-switcher";
import { useT } from "@/lib/i18n";

const INDUSTRIES = [
  "Technology",
  "Design & Creative",
  "Marketing & Advertising",
  "Consulting",
  "Education",
  "Healthcare",
  "Finance & Accounting",
  "Legal",
  "Real Estate",
  "E-commerce",
  "Media & Entertainment",
  "Other",
] as const;

const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "SAR", label: "SAR — Saudi Riyal" },
  { code: "EGP", label: "EGP — Egyptian Pound" },
  { code: "JOD", label: "JOD — Jordanian Dinar" },
  { code: "KWD", label: "KWD — Kuwaiti Dinar" },
  { code: "QAR", label: "QAR — Qatari Riyal" },
] as const;

const fieldClass =
  "w-full rounded-md border py-2 outline-none ring-slate-200 focus:ring h-[44px] border-dashed border-[#E6E6E6] bg-transparent px-4 text-sm text-black";

const selectClass =
  "w-full rounded-md border py-2 outline-none ring-slate-200 focus:ring h-[44px] border-dashed border-[#E6E6E6] bg-white px-4 text-sm text-black appearance-none cursor-pointer";

const errorClass = "text-[12px] text-destructive mt-1";

export default function OnboardingPage() {
  const { status, businessId, createBusiness } = useAuth();
  const router = useRouter();
  const t = useT();

  const schema = z.object({
    name: z
      .string()
      .min(2, t("onboarding.nameRequired"))
      .max(100, t("onboarding.nameTooLong")),
    industry: z.string().min(1, t("onboarding.industryRequired")),
    currency: z.string().min(1, t("onboarding.currencyRequired")),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", industry: "", currency: "USD" },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    } else if (status === "authenticated" && businessId) {
      router.replace("/home");
    }
  }, [status, businessId, router]);

  if (status === "loading" || (status === "authenticated" && businessId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const onSubmit = async (values: FormValues) => {
    try {
      await createBusiness(values);
      toast.success(t("onboarding.successMessage"));
      router.push("/home");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : t("onboarding.errorMessage"),
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <Logo className="w-14 h-14" />
          </div>
          <span className="text-3xl font-bold tracking-tight font-sans text-[#0052FC]">
            Freelr
          </span>
          <LanguageSwitcher />
        </div>

        <div className="relative w-full rounded-[24px] border border-[#E6E6E6] bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#0052FC]/10 flex items-center justify-center mb-1">
              <Building2 className="w-6 h-6 text-[#0052FC]" />
            </div>
            <h2 className="text-[24px] font-bold leading-[32px] text-black/90">
              {t("onboarding.title")}
            </h2>
            <p className="text-center text-[14px] font-normal leading-[20px] text-[#606060]">
              {t("onboarding.subtitle")}
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">
                {t("onboarding.businessNameLabel")}
              </label>
              <input
                className={fieldClass}
                placeholder={t("onboarding.businessNamePlaceholder")}
                autoComplete="organization"
                {...register("name")}
              />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">
                {t("onboarding.industryLabel")}
              </label>
              <div className="relative">
                <select className={selectClass} {...register("industry")}>
                  <option value="" disabled>
                    {t("onboarding.industryPlaceholder")}
                  </option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#606060]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              {errors.industry && <p className={errorClass}>{errors.industry.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-medium uppercase tracking-[1px] text-[#606060]">
                {t("onboarding.currencyLabel")}
              </label>
              <div className="relative">
                <select className={selectClass} {...register("currency")}>
                  {CURRENCIES.map(({ code, label }) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#606060]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              {errors.currency && <p className={errorClass}>{errors.currency.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-4 py-2 transition mt-2 h-[51px] w-full rounded-[14px] bg-[#121212] text-[16px] font-semibold text-white hover:bg-[#121212]/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t("onboarding.submitButton")
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-[#606060]">
          {t("onboarding.updateLater")}
        </p>
      </div>
    </div>
  );
}
