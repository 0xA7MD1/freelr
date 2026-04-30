"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Building2,
  Globe,
  Loader2,
  MapPin,
  Phone,
  ArrowRight,
  Pencil,
  X,
  Briefcase,
  BadgeDollarSign,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Button } from "@/components/shared/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { businessApi } from "@/lib/api/business";
import { ApiError, isApiConfigured } from "@/lib/api/client";
import type { Business } from "@/lib/api/types";
import Link from "next/link";

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
  { code: "USD", label: "USD — دولار أمريكي" },
  { code: "EUR", label: "EUR — يورو" },
  { code: "GBP", label: "GBP — جنيه إسترليني" },
  { code: "AED", label: "AED — درهم إماراتي" },
  { code: "SAR", label: "SAR — ريال سعودي" },
  { code: "EGP", label: "EGP — جنيه مصري" },
  { code: "JOD", label: "JOD — دينار أردني" },
  { code: "KWD", label: "KWD — دينار كويتي" },
  { code: "QAR", label: "QAR — ريال قطري" },
] as const;

const FALLBACK_BUSINESS: Business = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "نشاطي التجاري",
  description: "",
  industry: "Technology",
  currency: "USD",
  address: null,
  phone: null,
  website: null,
};

const schema = z.object({
  name: z.string().min(2, "الاسم مطلوب (حد أدنى حرفان)").max(100, "الاسم طويل جداً"),
  description: z.string().max(500, "الوصف طويل جداً").optional(),
  industry: z.string().optional(),
  currency: z.string().min(1, "العملة مطلوبة"),
  address: z.string().max(200, "العنوان طويل جداً").optional(),
  phone: z.string().max(30, "رقم الهاتف غير صحيح").optional(),
  website: z
    .string()
    .optional()
    .refine(
      (v) => !v || v === "" || /^https?:\/\/.+/.test(v),
      "يجب أن يبدأ الموقع بـ http:// أو https://",
    ),
});

type FormValues = z.infer<typeof schema>;

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[80px]";

function toFormValues(b: Business): FormValues {
  return {
    name: b.name,
    description: b.description ?? "",
    industry: b.industry ?? "",
    currency: b.currency,
    address: b.address ?? "",
    phone: b.phone ?? "",
    website: b.website ?? "",
  };
}

export function BusinessTab() {
  const { user, businessId, setCurrency } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const load = useCallback(async () => {
    if (!isApiConfigured()) {
      setBusiness(FALLBACK_BUSINESS);
      reset(toFormValues(FALLBACK_BUSINESS));
      setLoading(false);
      return;
    }
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await businessApi.getByOwner(user.id);
      setBusiness(data);
      reset(toFormValues(data));
    } catch {
      toast.error("تعذر تحميل بيانات النشاط التجاري.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, reset]);

  useEffect(() => {
    load();
  }, [load]);

  const cancelEdit = () => {
    if (business) reset(toFormValues(business));
    setEditing(false);
  };

  const onSubmit = async (values: FormValues) => {
    if (!businessId || !user?.id) return;
    if (!isApiConfigured()) {
      setBusiness((prev) => (prev ? { ...prev, ...values } : prev));
      setEditing(false);
      toast.success("تم حفظ التغييرات (وضع تجريبي).");
      return;
    }
    try {
      await businessApi.update(businessId, {
        ownerId: user.id,
        name: values.name,
        description: values.description || undefined,
        industry: values.industry || undefined,
        currency: values.currency,
        address: values.address || undefined,
        phone: values.phone || undefined,
        website: values.website || undefined,
      });
      setBusiness((prev) => (prev ? { ...prev, ...values } : prev));
      setCurrency(values.currency);
      setEditing(false);
      toast.success("تم حفظ معلومات النشاط التجاري بنجاح.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "تعذر حفظ التغييرات.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/profile"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              الملف الشخصي
            </Link>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">النشاط التجاري</h2>
          <p className="text-muted-foreground text-sm mt-1">
            المعلومات التي تظهر في الفواتير والتقارير المرسلة للعملاء.
          </p>
        </div>
        {!editing && !loading && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="shrink-0 gap-1.5">
            <Pencil className="w-3.5 h-3.5" />
            تعديل
          </Button>
        )}
        {editing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelEdit}
            disabled={isSubmitting}
            className="shrink-0 text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Identity card */}
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">هوية النشاط التجاري</CardTitle>
                  <CardDescription className="text-xs mt-0.5">الاسم والوصف والمجال.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="biz-name" className="text-xs font-medium">اسم النشاط التجاري</Label>
                <Input
                  id="biz-name"
                  placeholder="مثال: شركة التقنية المتقدمة"
                  disabled={!editing}
                  className="h-9 text-sm"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-desc" className="text-xs font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    الوصف
                  </span>
                </Label>
                <textarea
                  id="biz-desc"
                  className={textareaClass}
                  placeholder="وصف مختصر لنشاطك التجاري..."
                  disabled={!editing}
                  {...register("description")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-industry" className="text-xs font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    المجال
                  </span>
                </Label>
                <select
                  id="biz-industry"
                  className={selectClass}
                  disabled={!editing}
                  {...register("industry")}
                >
                  <option value="">غير محدد</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Preferences card */}
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BadgeDollarSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">التفضيلات المالية</CardTitle>
                  <CardDescription className="text-xs mt-0.5">العملة الافتراضية للفواتير والتقارير.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label htmlFor="biz-currency" className="text-xs font-medium">العملة الافتراضية</Label>
                <select
                  id="biz-currency"
                  className={selectClass}
                  disabled={!editing}
                  {...register("currency")}
                >
                  {CURRENCIES.map(({ code, label }) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
                {errors.currency && (
                  <p className="text-xs text-destructive">{errors.currency.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact card */}
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">معلومات الاتصال</CardTitle>
                  <CardDescription className="text-xs mt-0.5">العنوان ورقم الهاتف والموقع الإلكتروني.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="biz-address" className="text-xs font-medium">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    العنوان
                  </span>
                </Label>
                <Input
                  id="biz-address"
                  placeholder="مثال: الرياض، المملكة العربية السعودية"
                  disabled={!editing}
                  className="h-9 text-sm"
                  {...register("address")}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="biz-phone" className="text-xs font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      رقم الهاتف
                    </span>
                  </Label>
                  <Input
                    id="biz-phone"
                    type="tel"
                    dir="ltr"
                    placeholder="+966 5x xxx xxxx"
                    disabled={!editing}
                    className="h-9 text-sm"
                    {...register("phone")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="biz-website" className="text-xs font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      الموقع الإلكتروني
                    </span>
                  </Label>
                  <Input
                    id="biz-website"
                    type="url"
                    dir="ltr"
                    placeholder="https://example.com"
                    disabled={!editing}
                    className="h-9 text-sm"
                    {...register("website")}
                  />
                  {errors.website && (
                    <p className="text-xs text-destructive">{errors.website.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {editing && (
            <div className="flex gap-3">
              <Button
                type="submit"
                className="h-9 text-sm font-semibold"
                disabled={isSubmitting || !isDirty}
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin ml-2" />}
                حفظ التغييرات
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 text-sm"
                onClick={cancelEdit}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
