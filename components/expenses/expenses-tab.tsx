"use client";

import { useState } from "react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Coffee, Monitor, Plus, ShoppingBag, Zap, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface Expense {
  id: string;
  amount: number;
  category: string;
  desc: string;
  date: Date;
}

const initialExpenses: Expense[] = [
  { id: "1", amount: 1500, category: "تسويق", desc: "إعلانات جوجل", date: new Date(2026, 3, 20) },
  { id: "2", amount: 450, category: "برمجيات", desc: "اشتراك Github & Vercel", date: new Date(2026, 3, 18) },
  { id: "3", amount: 120, category: "ضيافة", desc: "قهوة اجتماع عميل", date: new Date(2026, 3, 15) },
];

const categories = [
  { id: "تسويق", icon: Monitor, color: "bg-blue-500/10 text-blue-500" },
  { id: "برمجيات", icon: Zap, color: "bg-purple-500/10 text-purple-500" },
  { id: "معدات", icon: Briefcase, color: "bg-amber-500/10 text-amber-500" },
  { id: "ضيافة", icon: Coffee, color: "bg-rose-500/10 text-rose-500" },
  { id: "أخرى", icon: ShoppingBag, color: "bg-gray-500/10 text-gray-500" },
];

export function ExpensesTab() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !desc) {
      toast.error("يرجى تعبئة كافة الحقول");
      return;
    }
    
    const newExpense: Expense = {
      id: Math.random().toString(),
      amount: parseFloat(amount),
      category,
      desc,
      date: new Date()
    };

    setExpenses([newExpense, ...expenses]);
    setAmount("");
    setCategory("");
    setDesc("");
    toast.success("تم تسجيل المصروف بنجاح");
  };

  return (
    <div className="grid lg:grid-cols-[1fr_2fr] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Add form */}
      <Card className="shadow-sm border-border h-fit">
        <CardHeader>
          <CardTitle className="text-[clamp(1.125rem,3vw,1.5rem)]">تسجيل مصروف جديد</CardTitle>
          <CardDescription className="text-[clamp(0.8125rem,2vw,0.875rem)]">أضف تفاصيل المصروف ليبقى حسابك محدثاً.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[clamp(0.8125rem,2vw,0.875rem)]">المبلغ (AED)</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:bg-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[clamp(0.8125rem,2vw,0.875rem)]">التصنيف</Label>
              <Select value={category} onValueChange={(val) => setCategory(val || "")}>
                <SelectTrigger dir="rtl" className="bg-secondary/50 border-transparent focus:ring-primary focus:bg-transparent">
                  <SelectValue placeholder="اختر التصنيف..." />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <c.icon className="w-4 h-4 text-muted-foreground" />
                        {c.id}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[clamp(0.8125rem,2vw,0.875rem)]">الوصف</Label>
              <Input 
                placeholder="مالذي قمت بشرائه؟" 
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:bg-transparent"
              />
            </div>

            <Button type="submit" className="w-full sm:w-fit min-w-[50%] min-h-[44px] h-[clamp(2.75rem,6vw,3.5rem)] gap-2 mt-4 font-bold text-[clamp(0.875rem,2vw,1rem)]">
              <Plus className="w-4 h-4" /> إضافة المصروف
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="shadow-sm border-border overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border bg-card flex justify-between items-center shrink-0">
          <h4 className="font-bold text-[clamp(0.875rem,2.5vw,1rem)]">سجل المصروفات الأخير</h4>
        </div>
        <div className="flex-1 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-right text-[clamp(0.8125rem,2vw,0.875rem)] min-w-[max(600px,100%)]">
            <thead className="bg-secondary/50 text-muted-foreground text-[clamp(0.75rem,1.5vw,0.875rem)]">
              <tr className="border-b border-border">
                <th className="px-6 py-3 font-medium">التاريخ</th>
                <th className="px-6 py-3 font-medium">الوصف</th>
                <th className="px-6 py-3 font-medium">التصنيف</th>
                <th className="px-6 py-3 font-medium">المبلغ (AED)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {expenses.map((expense) => {
                const cat = categories.find(c => c.id === expense.category) || categories[4];
                return (
                  <tr key={expense.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground text-[clamp(0.8125rem,2vw,0.875rem)]">
                      {format(expense.date, "dd MMM yyyy", { locale: arSA })}
                    </td>
                    <td className="px-6 py-4 font-medium">{expense.desc}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[clamp(0.625rem,1.5vw,0.75rem)] font-bold ${cat.color} bg-opacity-20`}>
                        <cat.icon className="w-3 h-3 shrink-0" /> {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-destructive dark:text-red-400 font-bold whitespace-nowrap">
                      -{expense.amount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
                    </td>
                  </tr>
                )
              })}
              {expenses.length === 0 && (
                 <tr>
                    <td colSpan={4} className="text-center text-muted-foreground py-8">لم يتم تسجيل مصروفات بعد</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
