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
  Pencil,
  Phone,
  X,
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
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

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

export function BusinessCard() {
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
      toast.error(
        err instanceof ApiError ? err.message : "تعذر حفظ التغييرات.",
      );
    }
  };

  /* ── Loading skeleton ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <Card className="shadow-sm border-border">
        <CardContent className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  /* ── Main card ────────────────────────────────────────────────────────── */
  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>النشاط التجاري</CardTitle>
            <CardDescription className="mt-0.5">
              المعلومات التي تظهر للعملاء في الفواتير والتقارير.
            </CardDescription>
          </div>
        </div>

        {!editing ? (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setEditing(true)}
          >
            <Pencil className="w-3.5 h-3.5 ml-1.5" />
            تعديل
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground"
            onClick={cancelEdit}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="biz-name">اسم النشاط التجاري</Label>
            <Input
              id="biz-name"
              placeholder="مثال: شركة التقنية المتقدمة"
              disabled={!editing}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="biz-desc">الوصف</Label>
            <textarea
              id="biz-desc"
              className={textareaClass}
              placeholder="وصف مختصر لنشاطك التجاري..."
              disabled={!editing}
              {...register("description")}
            />
          </div>

          {/* Industry + Currency */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="biz-industry">المجال</Label>
              <select
                id="biz-industry"
                className={selectClass}
                disabled={!editing}
                {...register("industry")}
              >
                <option value="">غير محدد</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-currency">العملة الافتراضية</Label>
              <select
                id="biz-currency"
                className={selectClass}
                disabled={!editing}
                {...register("currency")}
              >
                {CURRENCIES.map(({ code, label }) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.currency && (
                <p className="text-xs text-destructive">
                  {errors.currency.message}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="biz-address">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                العنوان
              </span>
            </Label>
            <Input
              id="biz-address"
              placeholder="مثال: الرياض، المملكة العربية السعودية"
              disabled={!editing}
              {...register("address")}
            />
          </div>

          {/* Phone + Website */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="biz-phone">
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  رقم الهاتف
                </span>
              </Label>
              <Input
                id="biz-phone"
                type="tel"
                dir="ltr"
                placeholder="+966 5x xxx xxxx"
                disabled={!editing}
                {...register("phone")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-website">
                <span className="inline-flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  الموقع الإلكتروني
                </span>
              </Label>
              <Input
                id="biz-website"
                type="url"
                dir="ltr"
                placeholder="https://example.com"
                disabled={!editing}
                {...register("website")}
              />
              {errors.website && (
                <p className="text-xs text-destructive">
                  {errors.website.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        {editing && (
          <CardFooter className="border-t border-border pt-4 gap-3">
            <Button
              type="submit"
              className="font-bold h-10"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : null}
              حفظ التغييرات
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={cancelEdit}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
