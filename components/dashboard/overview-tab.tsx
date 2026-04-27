"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowDownRight, ArrowUpRight, FileText, Wallet } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { name: "يناير", دخل: 12000, مصروفات: 8000 },
  { name: "فبراير", دخل: 14000, مصروفات: 9000 },
  { name: "مارس", دخل: 11000, مصروفات: 10000 },
  { name: "أبريل", دخل: 18000, مصروفات: 14000 },
  { name: "مايو", دخل: 10000, مصروفات: 14000 }, // Prediction month
];

export function OverviewTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Alert Section */}
      <div className="relative overflow-hidden bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-lg p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full">
        <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg shrink-0">
          <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-500" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-600"></span>
          </span>
        </div>
        <div className="relative z-10 flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 bg-orange-200 dark:bg-orange-900/50 px-2 py-0.5 rounded">تنبيه ذكي</span>
            <h3 className="font-bold text-base md:text-lg text-foreground truncate">تحذير سيولة للشهر القادم</h3>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl break-words">
            توقعات الذكاء الاصطناعي تشير إلى احتمال وجود عجز بقيمة <strong className="text-foreground">4,000 AED</strong> الشهر القادم بسبب الالتزامات الثابتة.
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
          <Button variant="outline" className="w-full sm:w-auto border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-800 dark:hover:text-orange-300 font-semibold rounded-md h-10 px-6 transition-colors">
            عرض خطة المعالجة
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-border flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b/0 space-y-0">
            <CardTitle className="text-muted-foreground text-sm font-medium">إجمالي الدخل</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">18,000 <span className="text-sm font-medium text-muted-foreground uppercase">AED</span></div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-500/10 w-fit px-2 py-1 rounded-[6px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              +12% من الشهر الماضي
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b/0 space-y-0">
            <CardTitle className="text-muted-foreground text-sm font-medium">المصروفات</CardTitle>
            <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">14,000 <span className="text-sm font-medium text-muted-foreground uppercase">AED</span></div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-destructive font-medium bg-destructive/10 w-fit px-2 py-1 rounded-[6px]">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
              +5% زيادة غير متوقعة
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b/0 space-y-0">
            <CardTitle className="text-muted-foreground text-sm font-medium">صافي الربح</CardTitle>
            <div className="w-8 h-8 rounded-full bg-[#0052FC]/10 text-[#0052FC] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">4,000 <span className="text-sm font-medium text-muted-foreground uppercase">AED</span></div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-secondary/70 w-fit px-2 py-1 rounded-[6px]">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span>
              هامش الربح: 22%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3 shadow-sm border-border min-w-0">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">تحليل السيولة النقدية</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{fill: 'var(--color-secondary)'}}
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--background)' }}
                  itemStyle={{ fontSize: '14px', fontFamily: 'var(--font-mono)' }}
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
                  <span className="w-2 h-2 bg-[#0052FC] rounded-full block animate-pulse"></span>
                </div>
                مقترحات الذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-foreground bg-secondary/30 p-3.5 rounded-xl border border-border/50 hover:bg-secondary/50 transition-colors">
                  <div className="text-emerald-500 mt-0.5">💡</div>
                  <div>
                    <span className="font-semibold block mb-0.5 text-xs text-muted-foreground">تخفيض التكاليف</span>
                    قلل الإنفاق التسويقي بنسبة 15% لهذا الشهر لتحقيق الهدف المستهدف.
                  </div>
                </li>
                <li className="flex gap-3 text-sm text-foreground bg-secondary/30 p-3.5 rounded-xl border border-border/50 hover:bg-secondary/50 transition-colors">
                  <div className="text-amber-500 mt-0.5">🕒</div>
                  <div>
                    <span className="font-semibold block mb-0.5 text-xs text-muted-foreground">تحصيل الأموال</span>
                    أرسل تذكير للعملاء المتأخرين (3 فواتير بقيمة 6,500 AED).
                  </div>
                </li>
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
              <tr className="hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-4 font-medium">شركة الأمل للتجارة</td>
                <td className="px-6 py-4 text-muted-foreground">22 مايو</td>
                <td className="px-6 py-4">4,500 AED</td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold">مدفوعة</span>
                </td>
              </tr>
              <tr className="hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-4 font-medium">مؤسسة رؤية المستقبل</td>
                <td className="px-6 py-4 text-muted-foreground">18 مايو</td>
                <td className="px-6 py-4">2,200 AED</td>
                <td className="px-6 py-4">
                  <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-bold">متأخرة</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
