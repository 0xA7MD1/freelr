"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/shared/ui/card";
import { Label } from "@/components/shared/ui/label";
import { Button } from "@/components/shared/ui/button";
import { Textarea } from "@/components/shared/ui/textarea";
import { Bot, Sparkles, Send, Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { aiApi } from "@/lib/api/ai";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import type { AIAnalysisResponse } from "@/lib/api/types";

const RISK_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Low:      { label: "منخفض",  color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 className="w-4 h-4" /> },
  Medium:   { label: "متوسط",  color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",   icon: <AlertTriangle className="w-4 h-4" /> },
  High:     { label: "مرتفع",  color: "text-orange-500 bg-orange-500/10 border-orange-500/20",   icon: <TrendingDown className="w-4 h-4" /> },
  Critical: { label: "حرج",    color: "text-red-500 bg-red-500/10 border-red-500/20",             icon: <AlertTriangle className="w-4 h-4" /> },
};

function getRiskConfig(level: string) {
  return RISK_CONFIG[level] ?? RISK_CONFIG.Medium;
}

export function AITab() {
  const { businessId, currency } = useAuth();
  const [additionalContext, setAdditionalContext] = useState("");
  const [result, setResult] = useState<AIAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      toast.error("لم يتم العثور على بيانات المشروع. يرجى إكمال الإعداد أولاً.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const data = await aiApi.analyze({
        businessId,
        additionalContext: additionalContext.trim() || undefined,
      });
      setResult(data);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "عذراً، حدث خطأ أثناء تحليل بياناتك. حاول مرة أخرى.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const riskConfig = result ? getRiskConfig(result.riskLevel) : null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

      <div className="flex flex-col items-center text-center space-y-5 bg-card/50 py-10 px-6 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="w-20 h-20 rounded-[24px] bg-[#0052FC]/10 flex items-center justify-center text-[#0052FC] shadow-sm border border-[#0052FC]/20 relative z-10">
          <Bot className="w-10 h-10" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-foreground">المستشار المالي الذكي</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            يحلل الذكاء الاصطناعي بياناتك المالية الفعلية من آخر 3 أشهر ويقدم تقريراً شاملاً يتضمن تحليل المخاطر والتوصيات وفرص التحسين.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleAnalyze} className="lg:col-span-4 lg:sticky lg:top-24">
          <Card className="shadow-lg border-border/80 overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#0052FC]" />
            <CardHeader className="bg-secondary/10 pb-6 border-b border-border/40 pt-8">
              <CardTitle className="text-xl">التحليل الذكي</CardTitle>
              <CardDescription>يعتمد على بياناتك الفعلية المسجّلة في النظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2.5">
                <Label className="text-sm font-semibold">
                  سياق إضافي <span className="opacity-50 font-normal">(اختياري)</span>
                </Label>
                <Textarea
                  placeholder="مثال: لديّ مشروع جديد قيد الإطلاق الشهر القادم، أو أواجه تأخراً في تحصيل المدفوعات..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  rows={4}
                  className="bg-secondary/30 px-4 shadow-inner focus-visible:ring-[#0052FC] focus-visible:bg-transparent transition-colors resize-none"
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                سيقوم النظام بتحليل بيانات الدخل والمصروفات والفواتير الخاصة بمشروعك تلقائياً.
              </p>
            </CardContent>
            <CardFooter className="pb-6 px-6">
              <Button
                type="submit"
                size="lg"
                className={`w-full gap-3 text-base font-bold shadow-md hover:shadow-lg transition-all ${isLoading ? "bg-secondary text-muted-foreground hover:bg-secondary" : "bg-[#0052FC] text-white hover:bg-[#0052FC]/90"}`}
                disabled={isLoading || !businessId}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isLoading ? "جاري التحليل..." : "بدء التحليل الذكي"}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <div className="lg:col-span-8">
          {isLoading ? (
            <Card className="bg-card/40 border-border/60 shadow-lg min-h-[500px] flex flex-col items-center justify-center p-10">
              <div className="flex flex-col items-center text-center space-y-6 w-full animate-in fade-in zoom-in-95 duration-500">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-24 h-24 bg-[#0052FC]/20 rounded-full animate-ping" />
                  <div className="w-16 h-16 bg-[#0052FC]/10 rounded-full flex items-center justify-center relative z-10 backdrop-blur-sm border border-[#0052FC]/30">
                    <Bot className="w-8 h-8 text-[#0052FC] animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-xl font-bold text-foreground">جاري إعداد التقرير...</h3>
                  <p className="text-sm text-muted-foreground">يقوم الذكاء الاصطناعي بدراسة بياناتك المالية الفعلية واستخراج التوصيات والمخاطر.</p>
                </div>
              </div>
            </Card>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">

              {/* Header + Risk Level */}
              <div className="flex items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold">تقرير التحليل المالي</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">بناءً على بياناتك الفعلية من آخر 3 أشهر</p>
                  </div>
                </div>
                {riskConfig && (
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${riskConfig.color}`}>
                    {riskConfig.icon}
                    مستوى الخطر: {riskConfig.label}
                  </span>
                )}
              </div>

              {/* Projected Cashflow */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0052FC]/10 flex items-center justify-center text-[#0052FC] shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">التدفق النقدي المتوقع</p>
                      <p className={`text-2xl font-bold ${result.projectedCashflow >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {result.projectedCashflow.toLocaleString("ar-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency ?? "AED"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Analysis */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3 pt-5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    تحليل المخاطر
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">{result.riskAnalysis}</p>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-3 pt-5">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      التوصيات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-5">
                    <ul className="space-y-3">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Optimization Opportunities */}
              {result.optimizationOpportunities.length > 0 && (
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-3 pt-5">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      فرص التحسين
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-5">
                    <ul className="space-y-3">
                      {result.optimizationOpportunities.map((opp, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <span className="w-5 h-5 rounded-full bg-yellow-500/10 text-yellow-600 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-card/40 border-border/60 shadow-lg min-h-[500px] flex flex-col items-center justify-center p-10">
              <div className="flex flex-col items-center justify-center text-center max-w-sm mb-4">
                <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mb-6 shadow-sm border border-border/50">
                  <Send className="w-10 h-10 text-muted-foreground/30 -ml-2 translate-y-1" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">أنا بانتظارك</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  اضغط على زر &quot;بدء التحليل الذكي&quot; وسأقوم بتحليل بياناتك المالية الفعلية وتقديم تقرير شامل يساعدك في اتخاذ قرارات أفضل.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

    </div>
  );
}
