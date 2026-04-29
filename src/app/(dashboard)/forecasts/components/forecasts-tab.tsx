"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import {
  TrendingUp, TrendingDown, Wallet, AlertTriangle,
  RefreshCw, CheckCircle2, Calendar, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useFetch } from "@/lib/hooks/use-fetch";
import { forecastApi } from "@/lib/api/forecast";
import { isApiConfigured } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import type { ForecastResponse } from "@/lib/api/types";

// ─── helpers ────────────────────────────────────────────────────────────────

type RiskKey = "Low" | "Medium" | "High" | "Critical";

const RISK_CONFIG: Record<RiskKey, { label: string; badgeClass: string; icon: typeof TrendingUp; iconClass: string; bg: string }> = {
  Low:      { label: "منخفض",  badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", icon: TrendingUp,   iconClass: "text-emerald-500", bg: "bg-emerald-500/10" },
  Medium:   { label: "متوسط",  badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",         icon: TrendingUp,   iconClass: "text-amber-500",   bg: "bg-amber-500/10" },
  High:     { label: "مرتفع",  badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",                 icon: TrendingDown, iconClass: "text-red-500",     bg: "bg-red-500/10" },
  Critical: { label: "حرج",    badgeClass: "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200 font-bold",       icon: AlertTriangle,iconClass: "text-red-600",     bg: "bg-red-600/10" },
};

function getRisk(level: string) {
  return RISK_CONFIG[level as RiskKey] ?? RISK_CONFIG.Low;
}

function fmt(n?: number) {
  return (n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d?: string) {
  if (!d) return "—";
  try { return new Intl.DateTimeFormat("ar-AE", { year: "numeric", month: "long", day: "numeric" }).format(new Date(d)); }
  catch { return d; }
}

// ─── KPI card ───────────────────────────────────────────────────────────────

function KpiCard({ title, value, currency, icon, tone }: {
  title: string; value?: number; currency: string;
  icon: React.ReactNode; tone: "positive" | "negative" | "neutral";
}) {
  const ring = tone === "positive" ? "bg-emerald-500/10 text-emerald-500"
    : tone === "negative" ? "bg-destructive/10 text-destructive"
      : "bg-[#0052FC]/10 text-[#0052FC]";
  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ring}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {fmt(value)} <span className="text-sm font-medium text-muted-foreground uppercase">{currency}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── main component ─────────────────────────────────────────────────────────

export function ForecastsTab() {
  const { businessId, currency } = useAuth();
  const apiOn = isApiConfigured() && !!businessId;
  const curr = currency ?? "USD";

  const { data: forecast, isLoading, setData } = useFetch<ForecastResponse | null>(
    () => forecastApi.getLatest(businessId!),
    { enabled: apiOn, cacheKey: `forecast-latest-${businessId}` },
  );

  const [generating, setGenerating] = useState(false);
  const generatingRef = useRef(false);

  const handleGenerate = async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setGenerating(true);
    try {
      const result = await forecastApi.generate(businessId!);
      setData(result);
      toast.success("تم توليد التوقعات بنجاح.");
    } catch {
      toast.error("تعذّر توليد التوقعات. تأكد من وجود بيانات مالية كافية.");
    } finally {
      setGenerating(false);
      generatingRef.current = false;
    }
  };

  const riskMeta = getRisk(String(forecast?.riskLevel ?? "Low"));
  const RiskIcon = riskMeta.icon;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">التوقعات المالية</h2>
          <p className="text-muted-foreground text-sm">توقعات مبنية على متوسط آخر 6 أشهر من الأداء المالي الفعلي.</p>
        </div>
        <Button onClick={handleGenerate} disabled={generating || !apiOn} className="bg-[#0052FC] hover:bg-[#0047e0] text-white gap-2 shrink-0">
          {generating
            ? <><Loader2 className="w-4 h-4 animate-spin" />جاري التوليد...</>
            : <><RefreshCw className="w-4 h-4" />توليد توقع جديد</>}
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !forecast && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-3">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold text-foreground">لا يوجد توقع بعد</h3>
          <p className="text-sm max-w-xs">اضغط "توليد توقع جديد" لتوليد أول تحليل مالي مستقبلي بناءً على بياناتك.</p>
        </div>
      )}

      {/* Forecast content */}
      {!isLoading && forecast && (
        <>
          {/* Period + risk badge */}
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>الفترة المتوقعة:</span>
              <span className="font-semibold text-foreground">{fmtDate(forecast.periodStart)} — {fmtDate(forecast.periodEnd)}</span>
            </div>
            <div className="flex items-center gap-2 mr-auto">
              <span className="text-sm text-muted-foreground">مستوى المخاطر:</span>
              <Badge variant="outline" className={`text-xs px-3 py-1 rounded-full border-0 ${riskMeta.badgeClass}`}>
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center ml-1.5 ${riskMeta.bg}`}>
                  <RiskIcon className={`w-3 h-3 ${riskMeta.iconClass}`} />
                </div>
                {riskMeta.label}
              </Badge>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard title="الدخل المتوقع" value={forecast.expectedIncome} currency={curr} tone="positive" icon={<TrendingUp className="w-4 h-4" />} />
            <KpiCard title="المصروفات المتوقعة" value={forecast.expectedExpenses} currency={curr} tone="negative" icon={<TrendingDown className="w-4 h-4" />} />
            <KpiCard title="صافي التدفق النقدي" value={forecast.netCashflow} currency={curr} tone="neutral" icon={<Wallet className="w-4 h-4" />} />
          </div>

          {/* Shortage warning */}
          {(forecast.expectedShortage ?? 0) > 0 && (
            <div className="flex items-start gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400 text-sm mb-0.5">تحذير عجز نقدي</p>
                <p className="text-sm text-red-600/80 dark:text-red-300/80">
                  يُتوقع عجز بمقدار <span className="font-bold">{fmt(forecast.expectedShortage)} {curr}</span> خلال الفترة القادمة.
                </p>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {forecast.recommendations?.length > 0 && (
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <div className="bg-[#0052FC]/10 p-1.5 rounded-md">
                    <span className="w-2 h-2 bg-[#0052FC] rounded-full block" />
                  </div>
                  التوصيات
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {forecast.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm bg-secondary/30 p-3.5 rounded-xl border border-border/50">
                      <div className="w-6 h-6 rounded-full bg-[#0052FC]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0052FC]" />
                      </div>
                      <span className="text-foreground leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
