"use client";

import { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Send, Loader2 } from "lucide-react";

export function AITab() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [industry, setIndustry] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!income || !expenses) return;
    
    setIsLoading(true);
    setAnalysis("");

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key applies missing");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `أنا مستقل/فريلانسر أعمل في مجال ${industry || "غير محدد"}.
متوسط دخلي الشهري هو ${income} درهم.
ومتوسط مصروفاتي الشهرية هي ${expenses} درهم.

كخبير مالي، قدم لي:
1. تحليل سريع لوضعي المالي.
2. نسبة الربح الحالية وهل هي جيدة؟
3. توقع للسيولة (Cashflow) خلال الأشهر القادمة إذا استمر الوضع هكذا.
4. ثلاث نصائح عملية لتقليل المصروفات أو زيادة الدخل.

الرجاء تقديم إجابة مختصرة، احترافية ومباشرة وبتنسيق Markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      setAnalysis(response.text || "لم أتمكن من إيجاد تحليل، يرجى المحاولة مرة أخرى.");
    } catch (error) {
      console.error(error);
      setAnalysis("عذراً، حدث خطأ أثناء تحليل بياناتك. يرجى التأكد من إضافة مفتاح API صحيح.");
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
                <p className="text-sm text-muted-foreground">يقوم الذكاء الاصطناعي الآن بدارسة أرقامك لحساب نسب السيولة، ومقارنة مصروفاتك بالمتوسط، واستخراج أهم 3 نصائح عملية لتحسين وضعك.</p>
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
              
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
                prose-headings:text-foreground prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg
                prose-p:leading-relaxed prose-p:text-muted-foreground 
                prose-li:marker:text-[#0052FC] prose-ul:my-6 prose-li:my-2
                prose-strong:text-foreground prose-strong:font-bold">
                {analysis.split('\n').map((line, i) => {
                  if (line.startsWith('#')) {
                    const level = line.match(/^#+/)?.[0].length || 1;
                    const text = line.replace(/^#+\s/, '');
                    const Tag = `h${level + 1}` as keyof React.JSX.IntrinsicElements;
                    return <Tag key={i} className="mt-8 mb-4 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#0052FC] inline-block shrink-0"></span>
                       {text}
                    </Tag>;
                  }
                  if (line.startsWith('* ') || line.startsWith('- ')) {
                    const text = line.substring(2);
                    // Bold handling via simple regex replacing **text** with <strong>text</strong>
                    const parts = text.split(/(\*\*.*?\*\*)/g).map((part, p_idx) => {
                       if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={p_idx}>{part.slice(2, -2)}</strong>;
                       }
                       return part;
                    });
                    return <li key={i} className="ml-4 pl-2 leading-relaxed text-muted-foreground">{parts}</li>;
                  }
                  if (line.match(/^\d+\.\s/)) {
                    const text = line.replace(/^\d+\.\s/, '');
                     const parts = text.split(/(\*\*.*?\*\*)/g).map((part, p_idx) => {
                       if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={p_idx}>{part.slice(2, -2)}</strong>;
                       }
                       return part;
                    });
                    return <div key={i} className="font-semibold text-foreground mt-6 mb-2 flex items-start gap-3 bg-secondary/30 p-4 rounded-xl border border-border/50">
                      <span className="bg-background shadow-sm text-foreground w-6 h-6 rounded-md flex items-center justify-center shrink-0">{line.match(/^\d+/)?.[0]}</span>
                      <div className="pt-0.5">{parts}</div>
                    </div>;
                  }
                  if (!line.trim()) return null;
                  
                  // Wrap any bold markdown
                  const parts = line.split(/(\*\*.*?\*\*)/g).map((part, p_idx) => {
                     if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={p_idx}>{part.slice(2, -2)}</strong>;
                     }
                     return part;
                  });
                  return <p key={i} className="my-3 text-base leading-relaxed text-muted-foreground">{parts}</p>;
                })}
              </div>
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
