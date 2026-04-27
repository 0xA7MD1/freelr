"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { AlertCircle, ArrowDownRight, ArrowUpRight, Loader2, Wallet } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useFetch } from "@/lib/hooks/use-fetch";
import { dashboardApi } from "@/lib/api/dashboard";
import { isApiConfigured } from "@/lib/api/client";
import {
  MOCK_CHART,
  MOCK_CURRENCY,
  MOCK_DASHBOARD,
  MOCK_EXPENSES_CHANGE_PCT,
  MOCK_INCOME_CHANGE_PCT,
  MOCK_INSIGHTS,
  MOCK_LIQUIDITY_ALERT,
  MOCK_PROFIT_MARGIN_PCT,
  MOCK_RECENT_INVOICES,
} from "@/lib/api/mocks";
import { InvoiceStatus, type DashboardOverview } from "@/lib/api/types";

const INVOICE_STATUS_LABEL: Record<InvoiceStatus, { label: string; className: string }> = {
  [InvoiceStatus.Draft]: { label: "مسودة", className: "bg-slate-100 text-slate-700" },
  [InvoiceStatus.Sent]: { label: "مُرسلة", className: "bg-blue-100 text-blue-700" },
  [InvoiceStatus.Paid]: { label: "مدفوعة", className: "bg-emerald-100 text-emerald-700" },
  [InvoiceStatus.PartiallyPaid]: { label: "مدفوعة جزئياً", className: "bg-amber-100 text-amber-700" },
  [InvoiceStatus.Overdue]: { label: "متأخرة", className: "bg-red-100 text-red-700" },
  [InvoiceStatus.Cancelled]: { label: "ملغاة", className: "bg-gray-100 text-gray-500" },
};

const DEMO_BUSINESS_ID = "00000000-0000-0000-0000-000000000000";

function formatAmount(n: number) {
  return n.toLocaleString("en-US");
}

export function OverviewTab() {
  const { data, isLoading, error } = useFetch<DashboardOverview>(
    () => dashboardApi.overview(DEMO_BUSINESS_ID),
    {
      fallback: MOCK_DASHBOARD,
      enabled: isApiConfigured(),
    },
  );

  const overview = data ?? MOCK_DASHBOARD;
  const usingMock = !isApiConfigured() || (!!error && !data);

  const chartData = MOCK_CHART.map((p) => ({ name: p.name, دخل: p.income, مصروفات: p.expenses }));
  const insights = MOCK_INSIGHTS;
  const recentInvoices = MOCK_RECENT_INVOICES;
  const liquidityAlert = MOCK_LIQUIDITY_ALERT;

  if (isLoading && !overview) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {usingMock && (
        <div className="text-xs text-muted-foreground bg-secondary/40 border border-border/50 rounded-md px-3 py-2">
          يتم عرض بيانات تجريبية — سيتم استبدالها بالبيانات الحقيقية عند ربط الواجهة بالخادم.
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 bg-orange-200 dark:bg-orange-900/50 px-2 py-0.5 rounded">تنبيه ذكي</span>
              <h3 className="font-bold text-base md:text-lg text-foreground truncate">تحذير سيولة للشهر القادم</h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl break-words">
              {liquidityAlert.message.replace(
                /\{amount\}/g,
                `${formatAmount(liquidityAlert.expectedShortfall)} ${liquidityAlert.currency}`,
              )}
            </p>
          </div>
          <div className="relative z-10 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
            <Button variant="outline" className="w-full sm:w-auto border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-800 dark:hover:text-orange-300 font-semibold rounded-md h-10 px-6 transition-colors">
              عرض خطة المعالجة
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="إجمالي الدخل"
          value={overview.totalIncome}
          currency={MOCK_CURRENCY}
          tone="positive"
          icon={<ArrowUpRight className="w-4 h-4" />}
          changePct={MOCK_INCOME_CHANGE_PCT}
          changeLabel="من الشهر الماضي"
        />
        <KpiCard
          title="المصروفات"
          value={overview.totalExpenses}
          currency={MOCK_CURRENCY}
          tone="negative"
          icon={<ArrowDownRight className="w-4 h-4" />}
          changePct={MOCK_EXPENSES_CHANGE_PCT}
          changeLabel="زيادة غير متوقعة"
        />
        <KpiCard
          title="صافي الربح"
          value={overview.netCashflow}
          currency={MOCK_CURRENCY}
          tone="info"
          icon={<Wallet className="w-4 h-4" />}
          margin={MOCK_PROFIT_MARGIN_PCT}
          extraClass="sm:col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3 shadow-sm border-border min-w-0">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">تحليل السيولة النقدية</CardTitle>
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
                <Bar dataKey="دخل" fill="#0052FC" radius={[4, 4, 0, 0]} />
                <Bar dataKey="مصروفات" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
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
                مقترحات الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
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
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-sm border-border overflow-hidden min-w-0">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card">
          <h4 className="font-bold text-sm">الفواتير الأخيرة</h4>
          <button className="text-muted-foreground text-xs hover:underline">عرض الكل</button>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-right text-sm whitespace-nowrap min-w-[600px]">
            <thead className="bg-secondary/50 text-muted-foreground text-xs">
              <tr className="border-b border-border">
                <th className="px-6 py-3 font-medium">العميل</th>
                <th className="px-6 py-3 font-medium">التاريخ</th>
                <th className="px-6 py-3 font-medium">المبلغ</th>
                <th className="px-6 py-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted-foreground py-8">لا توجد فواتير لعرضها بعد.</td>
                </tr>
              ) : (
                recentInvoices.map((inv) => {
                  const status = INVOICE_STATUS_LABEL[inv.status];
                  return (
                    <tr key={inv.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{inv.client}</td>
                      <td className="px-6 py-4 text-muted-foreground">{inv.date}</td>
                      <td className="px-6 py-4">{formatAmount(inv.amount)} {inv.currency}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${status.className}`}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
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
  extraClass?: string;
}

function KpiCard({ title, value, currency, icon, tone, changePct, changeLabel, margin, extraClass }: KpiCardProps) {
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
          {formatAmount(value)} <span className="text-sm font-medium text-muted-foreground uppercase">{currency}</span>
        </div>
        <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-1 rounded-[6px] ${toneBadge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          {margin !== undefined ? `هامش الربح: ${margin}%` : `${changePct! > 0 ? "+" : ""}${changePct}% ${changeLabel ?? ""}`}
        </div>
      </CardContent>
    </Card>
  );
}
