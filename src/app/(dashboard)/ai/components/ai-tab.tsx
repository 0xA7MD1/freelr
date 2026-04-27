"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Button } from "@/components/shared/ui/button";
import { Bot, Sparkles, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { aiApi } from "@/lib/api/ai";
import { ApiError } from "@/lib/api/client";
import { AnalysisMarkdown } from "./analysis-markdown";

export function AITab() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [industry, setIndustry] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const incomeNum = Number(income);
    const expensesNum = Number(expenses);
    if (!Number.isFinite(incomeNum) || !Number.isFinite(expensesNum)) {
      toast.error("يرجى إدخال أرقام صالحة للدخل والمصروفات.");
      return;
    }
    if (incomeNum < 0 || expensesNum < 0) {
      toast.error("لا يمكن أن تكون الأرقام بالسالب.");
      return;
    }

    setIsLoading(true);
    setAnalysis("");

    try {
      const { analysis: text } = await aiApi.analyze({
        income: incomeNum,
        expenses: expensesNum,
        industry: industry.trim() || undefined,
      });
      setAnalysis(text);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof ApiError
          ? error.message
          : "عذراً، حدث خطأ أثناء تحليل بياناتك. حاول مرة أخرى.";
      toast.error(message);
      setAnalysis("");
    } finally {
      setIsLoading(false);
    }
  };

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
            أدخل تفاصيل دخلك ومصروفاتك التقريبية وسيقوم الذكاء الاصطناعي بتقديم تحليل دقيق ونصائح عملية لزيادة أرباحك وتجنب أزمات السيولة.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleAnalyze} className="lg:col-span-4 lg:sticky lg:top-24">
          <Card className="shadow-lg border-border/80 overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#0052FC]" />
            <CardHeader className="bg-secondary/10 pb-6 border-b border-border/40 pt-8">
              <CardTitle className="text-xl">مؤشراتك المالية</CardTitle>
              <CardDescription>دقة البيانات تساعد في تقديم نصائح أفضل</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2.5">
                <Label className="text-sm font-semibold">متوسط الدخل الشهري (AED)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder="مثال: 18000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="bg-secondary/30 h-12 px-4 shadow-inner focus-visible:ring-[#0052FC] focus-visible:bg-transparent transition-colors"
                    required
                  />
                  <div className="absolute left-4 top-3.5 text-muted-foreground text-sm font-medium">AED</div>
                </div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-semibold">متوسط المصروفات الشهرية (AED)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder="مثال: 14000"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    className="bg-secondary/30 h-12 px-4 shadow-inner focus-visible:ring-destructive/50 focus-visible:bg-transparent transition-colors"
                    required
                  />
                  <div className="absolute left-4 top-3.5 text-muted-foreground text-sm font-medium">AED</div>
                </div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-sm font-semibold">مجال أو طبيعة العمل <span className="opacity-50 font-normal">(اختياري)</span></Label>
                <Input
                  placeholder="مثال: التصميم الجرافيكي، التسويق..."
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="bg-secondary/30 h-12 px-4 shadow-inner focus-visible:ring-[#0052FC] focus-visible:bg-transparent transition-colors"
                />
              </div>
            </CardContent>
            <CardFooter className="pb-6 px-6">
              <Button
                type="submit"
                size="lg"
                className={`w-full gap-3 text-base font-bold shadow-md hover:shadow-lg transition-all ${isLoading ? 'bg-secondary text-muted-foreground hover:bg-secondary' : 'bg-[#0052FC] text-white hover:bg-[#0052FC]/90'}`}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isLoading ? "جاري قراءة البيانات..." : "بدء التحليل الذكي"}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <Card className="lg:col-span-8 bg-card/40 border-border/60 shadow-lg min-h-[500px] flex flex-col items-center justify-center p-6 md:p-10 relative overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center text-center space-y-6 w-full animate-in fade-in zoom-in-95 duration-500">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-24 h-24 bg-[#0052FC]/20 rounded-full animate-ping" />
                <div className="w-16 h-16 bg-[#0052FC]/10 rounded-full flex items-center justify-center relative z-10 backdrop-blur-sm border border-[#0052FC]/30">
                  <Bot className="w-8 h-8 text-[#0052FC] animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-xl font-bold text-foreground">جاري إعداد التقرير...</h3>
                <p className="text-sm text-muted-foreground">يقوم الذكاء الاصطناعي الآن بدراسة أرقامك لحساب نسب السيولة، ومقارنة مصروفاتك بالمتوسط، واستخراج أهم 3 نصائح عملية لتحسين وضعك.</p>
              </div>
            </div>
          ) : analysis ? (
            <div className="w-full h-full animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border/50">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold">تقرير دقيق لوضعك المالي</h3>
                  <p className="text-sm text-muted-foreground mt-1">بناءً على المعطيات التي شاركتها</p>
                </div>
              </div>
              <AnalysisMarkdown text={analysis} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center max-w-sm mb-4">
              <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mb-6 shadow-sm border border-border/50">
                <Send className="w-10 h-10 text-muted-foreground/30 -ml-2 translate-y-1" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">أنا بانتظارك</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                املأ النموذج على اليمين ثم اضغط على زر &quot;بدء التحليل الذكي&quot; لأحصل على تقرير مالي شامل يساعدك في اتخاذ قرارات أفضل.
              </p>
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}



