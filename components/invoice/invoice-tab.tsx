"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QRCodeSVG } from "qrcode.react";
import { ExternalLink, Plus, Printer, Trash } from "lucide-react";
import { toast } from "sonner";

export function InvoiceTab() {
  const [clientName, setClientName] = useState("");
  const [items, setItems] = useState([{ desc: "", amount: "" }]);

  const handleAddItem = () => {
    setItems([...items, { desc: "", amount: "" }]);
  };

  const handleItemChange = (index: number, field: "desc" | "amount", value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const total = items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);

  const paymentLink = `https://pay.example.com/${btoa(clientName.slice(0, 5)) || "unknown"}?amount=${total}`;

  const handlePrint = () => {
    toast.success("جاري تحضير ملف PDF...", { description: "سيتم فتح نافذة الطباعة." });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Editor Section */}
      <Card className="print:hidden shadow-lg border-border/80 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-[#0052FC]" />
        <CardHeader className="bg-secondary/10 pb-6 border-b border-border/40 pt-8">
          <CardTitle className="text-xl">إنشاء فاتورة احترافية</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">قم بتعبئة النموذج لإنشاء فاتورة لعملائك</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 -mx-2 px-6">
          <div className="space-y-2.5">
            <Label htmlFor="clientName" className="text-sm font-semibold">اسم العميل أو جهة العمل</Label>
            <Input 
              id="clientName" 
              placeholder="مثال: شركة الأفق للإبداع"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="bg-secondary/30 h-12 px-4 shadow-inner focus-visible:ring-[#0052FC] focus-visible:bg-transparent transition-colors"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-semibold">تفاصيل الخدمات والمبالغ</Label>
            {items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-secondary/20 p-4 rounded-xl border border-border/50">
                <div className="flex-1 w-full space-y-1.5">
                  <Input 
                    placeholder="وصف الخدمة (مثال: تصميم شعار)" 
                    value={item.desc}
                    onChange={(e) => handleItemChange(index, "desc", e.target.value)}
                    className="bg-background h-11 border-border/60 focus-visible:ring-[#0052FC]"
                  />
                </div>
                <div className="w-full sm:w-32 space-y-1.5 shrink-0">
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder="المبلغ" 
                      value={item.amount}
                      onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                      className="bg-background h-11 px-3 border-border/60 focus-visible:ring-[#0052FC]"
                    />
                    <div className="absolute left-3 top-3 text-muted-foreground text-xs font-medium">AED</div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-full sm:w-11 h-11 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive border border-transparent sm:border-border/50 bg-background sm:bg-transparent mt-2 sm:mt-0 opacity-80 hover:opacity-100"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddItem} className="w-full sm:w-auto h-11 gap-2 border-dashed border-2 hover:border-[#0052FC]/50 hover:bg-[#0052FC]/5 text-muted-foreground hover:text-[#0052FC] transition-colors">
              <Plus className="w-4 h-4" /> إضافة بند آخر للفاتورة
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Preview Section */}
      <div className="space-y-4 lg:sticky lg:top-24">
        <div className="flex items-center justify-between print:hidden px-2">
          <h2 className="text-xl font-bold tracking-tight text-muted-foreground">المعاينة المباشرة</h2>
          <Button onClick={handlePrint} className="gap-2 font-bold bg-[#0052FC] hover:bg-[#0052FC]/90 text-white shadow-sm h-10 px-5 rounded-lg transition-transform hover:-translate-y-0.5">
             <Printer className="w-4 h-4" /> إصدار الفاتورة PDF
          </Button>
        </div>
        
        <Card className="print:shadow-none print:border-none print:m-0 overflow-hidden shadow-lg border-border/60 bg-white" id="invoice-preview">
          <div className="bg-[#0052FC] p-8 text-white print:bg-gray-100 print:text-black">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-inter)] tracking-tight">INVOICE</h1>
                <p className="opacity-80 font-mono text-sm uppercase">#INV-2026-001</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl mb-1">Freelr Studio</p>
                <p className="opacity-80 text-sm">التاريخ: {new Date().toLocaleDateString("ar-AE")}</p>
              </div>
            </div>
          </div>
          
          <CardContent className="p-8">
            <div className="mb-10">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">فاتورة إلى العميل</h3>
              <p className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 inline-block min-w-[50%]">{clientName || "—"}</p>
            </div>

            <Table className="mb-6">
              <TableHeader className="bg-gray-50 border-b border-gray-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[60%] text-right font-bold text-gray-500 rounded-tr-lg py-4">وصف الخدمة</TableHead>
                  <TableHead className="text-left font-bold text-gray-500 rounded-tl-lg py-4">المبلغ (AED)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.some(i => i.desc || i.amount) ? items.map((item, index) => (
                  <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-medium text-right py-5 text-gray-800">{item.desc || "..."}</TableCell>
                    <TableCell className="text-left font-mono py-5 font-medium text-gray-900">{item.amount || "0"}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-400 py-10 border-none italic">لم يتم إضافة أي بنود في هذه الفاتورة</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="mt-6 flex justify-end">
              <div className="w-1/2 min-w-[250px] border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 flex justify-between items-center p-4">
                  <span className="font-bold text-gray-500">الإجمالي المستحق</span>
                  <span className="font-bold text-2xl font-mono text-[#0052FC] print:text-black">{total.toLocaleString()} AED</span>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-gray-50 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between print:bg-white print:border print:border-gray-200 gap-6">
              <div className="max-w-[280px] text-center sm:text-right">
                <h4 className="font-bold mb-2 flex items-center justify-center sm:justify-start gap-2 text-gray-800">
                  دفع إلكتروني <ExternalLink className="w-4 h-4 text-gray-400" />
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">امسح رمز الاستجابة السريعة (QR Code) لإتمام عملية الدفع مباشرة عبر بوابة الدفع الآمنة.</p>
              </div>
              <div className="bg-white p-4 rounded-[16px] shadow-sm border border-gray-200 shrink-0">
                <QRCodeSVG value={paymentLink} size={88} level="H" fgColor="#0052FC" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
