"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { AlertCircle, ArrowDownRight, ArrowUpRight, Loader2, RefreshCw, Sparkles, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useFetch } from "@/lib/hooks/use-fetch";
import { dashboardApi } from "@/lib/api/dashboard";
import { invoicesApi } from "@/lib/api/invoices";
import { forecastApi } from "@/lib/api/forecast";
import { apiErrorMessage, isApiConfigured } from "@/lib/api/client";
import { aiApi } from "@/lib/api/ai";
import { useAuth } from "@/lib/auth/auth-context";
import { useT } from "@/lib/i18n";
import {
  MOCK_CHART,
  MOCK_CURRENCY,
  MOCK_DASHBOARD,
  MOCK_EXPENSES_CHANGE_PCT,
  MOCK_INCOME_CHANGE_PCT,
  MOCK_PROFIT_MARGIN_PCT,
  MOCK_RECENT_INVOICES,
} from "@/lib/api/mocks";
import {
  InvoiceStatus,
  type AIAnalysisResponse,
  type AIInsight,
  type Alert,
  type DashboardChartsData,
  type DashboardOverview,
  type ForecastResponse,
  type Invoice,
  type LiquidityAlert,
} from "@/lib/api/types";

function getStatusLabel(t: ReturnType<typeof useT>, status: InvoiceStatus | string | number) {
  const STATUS_MAP: Record<number, { labelKey: string; className: string }> = {
    [InvoiceStatus.Draft]:         { labelKey: "dashboard.invoiceStatus.draft",         className: "bg-slate-100 text-slate-700" },
    [InvoiceStatus.Sent]:          { labelKey: "dashboard.invoiceStatus.sent",          className: "bg-blue-100 text-blue-700" },
    [InvoiceStatus.Paid]:          { labelKey: "dashboard.invoiceStatus.paid",          className: "bg-emerald-100 text-emerald-700" },
    [InvoiceStatus.PartiallyPaid]: { labelKey: "dashboard.invoiceStatus.partiallyPaid", className: "bg-amber-100 text-amber-700" },
    [InvoiceStatus.Overdue]:       { labelKey: "dashboard.invoiceStatus.overdue",       className: "bg-red-100 text-red-700" },
    [InvoiceStatus.Cancelled]:     { labelKey: "dashboard.invoiceStatus.cancelled",     className: "bg-gray-100 text-gray-500" },
  };
  const key = typeof status === "string" ? InvoiceStatus[status as keyof typeof InvoiceStatus] ?? 0 : Number(status);
  const meta = STATUS_MAP[key] ?? { labelKey: "dashboard.invoiceStatus.draft", className: "bg-gray-100 text-gray-500" };
  return { label: t(meta.labelKey), className: meta.className };
}

function formatAmount(n: number) {
  return n.toLocaleString("en-US");
}

function formatDate(dateStr: string, locale: string) {
  try {
    return new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-US");
  } catch {
    return dateStr;
  }
}

export function OverviewTab() {
  const { businessId, currency } = useAuth();
  const t = useT();
  const apiOn = isApiConfigured() && !!businessId;
  const demoMode = !apiOn;
  const [planOpen, setPlanOpen] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [planResult, setPlanResult] = useState<AIAnalysisResponse | null>(null);

  const { data: overviewData, isLoading, error: overviewError, refetch: refetchOverview } = useFetch<DashboardOverview>(
    () => dashboardApi.overview(businessId!),
    {
      fallback: demoMode ? MOCK_DASHBOARD : undefined,
      enabled: apiOn,
      cacheKey: businessId ?? "mock",
    },
  );

  const { data: chartsData, error: chartsError } = useFetch<DashboardChartsData>(
    () => dashboardApi.charts(businessId!, 6),
    { enabled: apiOn, cacheKey: businessId ?? "mock" },
  );

  const { data: invoicesData, error: invoicesError } = useFetch<Invoice[]>(
    () => invoicesApi.list(businessId!),
    { enabled: apiOn, cacheKey: businessId ?? "mock" },
  );

  const { data: forecastData, isLoading: forecastLoading, setData: setForecastData } = useFetch<ForecastResponse | null>(
    () => forecastApi.getLatest(businessId!),
    { enabled: apiOn, cacheKey: `forecast-${businessId}` },
  );

  const { data: dashboardAlerts, error: alertsError } = useFetch<Alert[]>(
    () => dashboardApi.alerts(businessId!, false),
    { enabled: apiOn, cacheKey: `dash-alerts-${businessId}` },
  );

  const generatingForecast = useRef(false);
  useEffect(() => {
    if (!apiOn || forecastLoading || generatingForecast.current) return;
    generatingForecast.current = true;
    forecastApi
      .generate(businessId!)
      .then(setForecastData)
      .catch((err) => {
        toast.error(`${t("dashboard.overview.aiError")}: ${apiErrorMessage(err)}`);
      })
      .finally(() => {
        generatingForecast.current = false;
      });
  }, [apiOn, businessId, forecastLoading, setForecastData, t]);

  const toastedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const announce = (key: string, prefix: string, err: Error | null) => {
      if (!err || toastedRef.current.has(key)) return;
      toastedRef.current.add(key);
      toast.error(`${prefix}: ${apiErrorMessage(err)}`);
    };
    announce("charts", t("dashboard.overview.chartsError"), chartsError);
    announce("invoices", t("dashboard.overview.invoicesError"), invoicesError);
    announce("alerts", t("dashboard.overview.alertsError"), alertsError);
  }, [chartsError, invoicesError, alertsError, t]);

  const overview = overviewData;

  const incomeChangePct = overview?.incomeChangePercent ?? (demoMode ? MOCK_INCOME_CHANGE_PCT : 0);
  const expenseChangePct = overview?.expenseChangePercent ?? (demoMode ? MOCK_EXPENSES_CHANGE_PCT : 0);
  const profitMarginPct = overview && overview.netCashflow > 0 && overview.totalIncome > 0
    ? Math.round((overview.netCashflow / overview.totalIncome) * 100)
    : demoMode
      ? MOCK_PROFIT_MARGIN_PCT
      : 0;

  const incomeLabel = t("dashboard.overview.income");
  const expensesLabel = t("dashboard.overview.expensesChart");

  const chartData = useMemo(() => {
    const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { key, label: SHORT_MONTHS[d.getMonth()] };
    });

    if (chartsData?.incomeByMonth?.length) {
      const incomeMap = Object.fromEntries(chartsData.incomeByMonth.map((p) => [p.month, p.amount]));
      const expenseMap = Object.fromEntries(chartsData.expensesByMonth.map((p) => [p.month, p.amount]));
      return months.map(({ key, label }) => ({
        name: label,
        [incomeLabel]: incomeMap[key] ?? 0,
        [expensesLabel]: expenseMap[key] ?? 0,
      }));
    }
    return MOCK_CHART.map((p) => ({ name: p.name, [incomeLabel]: p.income, [expensesLabel]: p.expenses }));
  }, [chartsData, incomeLabel, expensesLabel]);

  const recentInvoices = useMemo(() => {
    if (invoicesData?.length) {
      return invoicesData.slice(0, 5).map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        client: inv.clientName,
        date: formatDate(inv.issueDate ?? inv.dueDate, "ar"),
        amount: inv.total,
        currency: currency ?? MOCK_CURRENCY,
        status: inv.status,
      }));
    }
    if (demoMode) return MOCK_RECENT_INVOICES;
    return [];
  }, [invoicesData, currency, demoMode]);

  const insights: AIInsight[] = useMemo(() => {
    if (!forecastData?.recommendations?.length) return [];
    return forecastData.recommendations.slice(0, 3).map((rec, i) => ({
      id: `forecast-${i}`,
      kind: (["saving", "collection", "info"] as const)[i] ?? "info",
      title: (["توصية مالية", "تحصيل الأموال", "معلومة"] as const)[i] ?? "معلومة",
      body: rec,
    } satisfies AIInsight));
  }, [forecastData]);

  const liquidityAlert: LiquidityAlert | null = useMemo(() => {
    const WARNING_TYPES = ["CashflowWarning", "LowBalance", "HighExpense", "OverdueInvoice"];
    const SEVERITY_ORDER = ["Critical", "Error", "Warning", "Info"];

    const relevantAlert = dashboardAlerts
      ?.filter((a) => !a.isRead && WARNING_TYPES.includes(a.alertType))
      ?.sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity))
      ?.at(0);

    if (relevantAlert) {
      const isHigh = relevantAlert.severity === "Critical" || relevantAlert.severity === "Error";
      return {
        severity: isHigh ? "danger" : "warning",
        expectedShortfall: forecastData?.expectedShortage ?? 0,
        currency: currency ?? MOCK_CURRENCY,
        message: relevantAlert.message,
      };
    }

    if (forecastData) {
      const shortage = forecastData.expectedShortage ?? 0;
      const riskLevel = String(forecastData.riskLevel ?? "Low");
      if (shortage > 0 || riskLevel === "High" || riskLevel === "Critical") {
        return {
          severity: riskLevel === "Critical" ? "danger" : "warning",
          expectedShortfall: shortage,
          currency: currency ?? MOCK_CURRENCY,
          message: shortage > 0
            ? `توقعات الذكاء الاصطناعي تشير إلى احتمال عجز بمقدار {amount} الشهر القادم. يُنصح بمتابعة الفواتير غير المحصّلة.`
            : `مستوى المخاطر مرتفع — راجع تقرير التحليل المالي لمزيد من التفاصيل.`,
        };
      }
    }

    return null;
  }, [dashboardAlerts, forecastData, currency]);

  const handleViewPlan = async () => {
    setPlanResult(null);
    setPlanOpen(true);
    setPlanLoading(true);
    try {
      const result = await aiApi.analyze({
        businessId: businessId!,
        additionalContext: liquidityAlert?.message,
      });
      setPlanResult(result);
    } catch (err) {
      toast.error(apiErrorMessage(err as Error));
      setPlanOpen(false);
    } finally {
      setPlanLoading(false);
    }
  };

  if (isLoading && !overview) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (apiOn && overviewError && !overview) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="font-bold text-base">{t("common.loadError")}</h3>
          <p className="text-sm text-muted-foreground">{apiErrorMessage(overviewError)}</p>
        </div>
        <Button onClick={() => void refetchOverview()} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        {t("common.noData")}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {demoMode && (
        <div className="text-xs text-muted-foreground bg-secondary/40 border border-border/50 rounded-md px-3 py-2">
          {t("common.demoMode")}
        </div>
      )}

      {apiOn && overviewError && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiErrorMessage(overviewError)}</span>
          </div>
          <button
            onClick={() => void refetchOverview()}
            className="text-xs font-semibold text-destructive hover:underline shrink-0"
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      {liquidityAlert && (
        <div className="relative overflow-hidden bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-lg p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full">
          <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg shrink-0">
            <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-500" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-600" />
            </span>
          </div>
          <div className="relative z-10 flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 bg-orange-200 dark:bg-orange-900/50 px-2 py-0.5 rounded">{t("dashboard.overview.smartAlert")}</span>
              <h3 className="font-bold text-base md:text-lg text-foreground truncate">{t("dashboard.overview.liquidityWarning")}</h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl break-words">
              {liquidityAlert.message.replace(
                /\{amount\}/g,
                `${formatAmount(liquidityAlert.expectedShortfall)} ${liquidityAlert.currency}`,
              )}
            </p>
          </div>
          <div className="relative z-10 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
            <Button
              variant="outline"
              onClick={() => void handleViewPlan()}
              disabled={planLoading || demoMode}
              className="w-full sm:w-auto border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-800 dark:hover:text-orange-300 font-semibold rounded-md h-10 px-6 transition-colors gap-2"
            >
              {planLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t("dashboard.overview.viewPlan")}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title={t("dashboard.overview.totalIncome")}
          value={overview.totalIncome}
          currency={currency ?? MOCK_CURRENCY}
          tone="positive"
          icon={<ArrowUpRight className="w-4 h-4" />}
          changePct={incomeChangePct}
          changeLabel={t("dashboard.overview.fromLastMonth")}
        />
        <KpiCard
          title={t("dashboard.overview.expenses")}
          value={overview.totalExpenses}
          currency={currency ?? MOCK_CURRENCY}
          tone="negative"
          icon={<ArrowDownRight className="w-4 h-4" />}
          changePct={expenseChangePct}
          changeLabel={t("dashboard.overview.unexpectedIncrease")}
        />
        <KpiCard
          title={t("dashboard.overview.netProfit")}
          value={overview.netCashflow}
          currency={currency ?? MOCK_CURRENCY}
          tone="info"
          icon={<Wallet className="w-4 h-4" />}
          margin={profitMarginPct}
          marginLabel={t("dashboard.overview.profitMargin")}
          extraClass="sm:col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3 shadow-sm border-border min-w-0">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">{t("dashboard.overview.liquidityAnalysis")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} dx={-10} />
                <Tooltip
                  cursor={{ fill: "var(--color-secondary)" }}
                  contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", background: "var(--background)" }}
                  itemStyle={{ fontSize: "14px", fontFamily: "var(--font-mono)" }}
                />
                <Bar dataKey={incomeLabel} fill="#0052FC" radius={[4, 4, 0, 0]} />
                <Bar dataKey={expensesLabel} fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-border h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <div className="bg-[#0052FC]/10 p-1.5 rounded-md">
                  <span className="w-2 h-2 bg-[#0052FC] rounded-full block animate-pulse" />
                </div>
                {t("dashboard.overview.aiSuggestions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              {forecastLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-secondary/40 animate-pulse" />
                  ))}
                </div>
              ) : insights.length > 0 ? (
                <ul className="space-y-3">
                  {insights.map((insight) => (
                    <li
                      key={insight.id}
                      className="flex gap-3 text-sm text-foreground bg-secondary/30 p-3.5 rounded-xl border border-border/50 hover:bg-secondary/50 transition-colors"
                    >
                      <div className={insight.kind === "saving" ? "text-emerald-500 mt-0.5" : "text-amber-500 mt-0.5"}>
                        {insight.kind === "saving" ? "💡" : insight.kind === "collection" ? "🕒" : "ℹ️"}
                      </div>
                      <div>
                        <span className="font-semibold block mb-0.5 text-xs text-muted-foreground">{insight.title}</span>
                        {insight.body}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-6 text-center text-muted-foreground gap-2">
                  <span className="text-2xl">🤖</span>
                  <p className="text-xs leading-relaxed max-w-[160px]">
                    {t("dashboard.overview.noSuggestions")}{" "}
                    <a href="/ai" className="text-[#0052FC] hover:underline font-medium">{t("dashboard.overview.goToAi")}</a>
                    {" "}{t("dashboard.overview.noSuggestionsEnd")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-sm border-border overflow-hidden min-w-0">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card">
          <h4 className="font-bold text-sm">{t("dashboard.overview.recentInvoices")}</h4>
          <button className="text-muted-foreground text-xs hover:underline">{t("dashboard.overview.viewAll")}</button>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-right text-sm whitespace-nowrap min-w-[600px]">
            <thead className="bg-secondary/50 text-muted-foreground text-xs">
              <tr className="border-b border-border">
                <th className="px-6 py-3 font-medium">{t("dashboard.overview.client")}</th>
                <th className="px-6 py-3 font-medium">{t("dashboard.overview.date")}</th>
                <th className="px-6 py-3 font-medium">{t("dashboard.overview.amount")}</th>
                <th className="px-6 py-3 font-medium">{t("dashboard.overview.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted-foreground py-8">{t("dashboard.overview.noInvoices")}</td>
                </tr>
              ) : (
                recentInvoices.map((inv) => {
                  const statusMeta = getStatusLabel(t, inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{inv.client}</td>
                      <td className="px-6 py-4 text-muted-foreground">{inv.date}</td>
                      <td className="px-6 py-4">{formatAmount(inv.amount)} {inv.currency}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusMeta.className}`}>{statusMeta.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-[#0052FC]" />
              {t("dashboard.overview.planDialogTitle")}
            </DialogTitle>
          </DialogHeader>
          {planLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-[#0052FC]" />
              <span className="text-sm">{t("dashboard.overview.planAnalyzing")}</span>
            </div>
          ) : planResult ? (
            <div className="space-y-4 overflow-y-auto max-h-[60vh] pe-1">
              <div className="rounded-lg bg-secondary/40 p-4 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("dashboard.overview.planRiskAnalysis")}</h4>
                <p className="text-sm leading-relaxed">{planResult.riskAnalysis}</p>
              </div>
              {planResult.recommendations.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">{t("dashboard.overview.planRecommendations")}</h4>
                  <ul className="space-y-2">
                    {planResult.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2 text-sm bg-secondary/30 rounded-lg p-3">
                        <span className="text-[#0052FC] font-bold shrink-0 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {planResult.optimizationOpportunities.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">{t("dashboard.overview.planOpportunities")}</h4>
                  <ul className="space-y-2">
                    {planResult.optimizationOpportunities.map((opp, i) => (
                      <li key={i} className="flex gap-2 text-sm bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20">
                        <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: number;
  currency: string;
  icon: React.ReactNode;
  tone: "positive" | "negative" | "info";
  changePct?: number;
  changeLabel?: string;
  margin?: number;
  marginLabel?: string;
  extraClass?: string;
}

function KpiCard({ title, value, currency, icon, tone, changePct, changeLabel, margin, marginLabel, extraClass }: KpiCardProps) {
  const toneRing =
    tone === "positive"
      ? "bg-emerald-500/10 text-emerald-500"
      : tone === "negative"
        ? "bg-destructive/10 text-destructive"
        : "bg-[#0052FC]/10 text-[#0052FC]";
  const toneBadge =
    tone === "positive"
      ? "text-emerald-600 bg-emerald-500/10"
      : tone === "negative"
        ? "text-destructive bg-destructive/10"
        : "text-muted-foreground bg-secondary/70";
  const dot =
    tone === "positive" ? "bg-emerald-600" : tone === "negative" ? "bg-destructive" : "bg-muted-foreground";

  return (
    <Card className={`shadow-sm border-border flex flex-col justify-between ${extraClass ?? ""}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toneRing}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          {value.toLocaleString("en-US")} <span className="text-sm font-medium text-muted-foreground uppercase">{currency}</span>
        </div>
        <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-1 rounded-[6px] ${toneBadge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          {margin !== undefined ? `${marginLabel}: ${margin}%` : `${(changePct ?? 0) > 0 ? "+" : ""}${changePct}% ${changeLabel ?? ""}`}
        </div>
      </CardContent>
    </Card>
  );
}
