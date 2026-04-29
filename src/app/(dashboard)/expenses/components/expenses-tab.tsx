"use client";

import { useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { arSA } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Button } from "@/components/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shared/ui/dialog";
import {
  Coffee,
  Edit2,
  ExternalLink,
  Loader2,
  Monitor,
  Paperclip,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingDown,
  Upload,
  Zap,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { useFetch } from "@/lib/hooks/use-fetch";
import { expensesApi } from "@/lib/api/expenses";
import { ApiError, isApiConfigured } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { MOCK_EXPENSES } from "@/lib/api/mocks";
import type { Expense, ExpenseCategory } from "@/lib/api/types";

const ICON_CYCLE = [Monitor, Zap, Briefcase, Coffee, ShoppingBag];
const COLOR_CYCLE = [
  "bg-blue-500/10 text-blue-500",
  "bg-purple-500/10 text-purple-500",
  "bg-amber-500/10 text-amber-500",
  "bg-rose-500/10 text-rose-500",
  "bg-gray-500/10 text-gray-500",
];

const MOCK_CATEGORIES = [
  { id: "تسويق",   name: "تسويق",   icon: Monitor,     color: COLOR_CYCLE[0] },
  { id: "برمجيات", name: "برمجيات", icon: Zap,         color: COLOR_CYCLE[1] },
  { id: "معدات",   name: "معدات",   icon: Briefcase,   color: COLOR_CYCLE[2] },
  { id: "ضيافة",   name: "ضيافة",   icon: Coffee,      color: COLOR_CYCLE[3] },
  { id: "أخرى",    name: "أخرى",    icon: ShoppingBag, color: COLOR_CYCLE[4] },
];

function safeFormatDate(value: string) {
  try { return format(parseISO(value), "dd MMM yyyy", { locale: arSA }); }
  catch { return value; }
}

// ─── ExpenseFormModal ────────────────────────────────────────────────────────

interface ExpenseFormModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categories: { id: string; name: string }[];
  businessId: string;
  userId: string;
  currency: string;
  /** Prefilled expense for edit mode; undefined = create mode */
  editing?: Expense;
  onSaved: (expense: Expense, isNew: boolean) => void;
}

function ExpenseFormModal({
  open, onOpenChange, categories, businessId, userId, currency, editing, onSaved,
}: ExpenseFormModalProps) {
  const isEdit = !!editing;

  const [amount, setAmount]     = useState(editing ? String(editing.amount) : "");
  const [catId,  setCatId]      = useState(editing?.categoryId ?? "");
  const [desc,   setDesc]       = useState(editing?.description ?? "");
  const [vendor, setVendor]     = useState(editing?.vendor ?? "");
  const [notes,  setNotes]      = useState(editing?.notes ?? "");
  const [recurring, setRecurring] = useState(editing?.isRecurring ?? false);
  const [date,   setDate]       = useState(
    editing?.expenseDate ? editing.expenseDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
  );
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setAmount(""); setCatId(""); setDesc(""); setVendor(""); setNotes("");
    setRecurring(false); setDate(new Date().toISOString().slice(0, 10));
  };

  const handleClose = () => { if (!busy) { reset(); onOpenChange(false); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!Number.isFinite(num) || num <= 0) { toast.error("يرجى إدخال مبلغ صالح أكبر من صفر."); return; }
    if (!catId || !desc.trim()) { toast.error("يرجى تعبئة الحقول المطلوبة."); return; }

    setBusy(true);
    const payload = {
      businessId,
      amount: num,
      description: desc.trim(),
      expenseDate: date,
      categoryId: catId,
      vendor: vendor.trim() || undefined,
      notes: notes.trim() || undefined,
      isRecurring: recurring,
    };

    try {
      if (isEdit && editing) {
        await expensesApi.update(editing.id, { ...payload, updatedBy: userId });
        onSaved({ ...editing, ...payload, category: categories.find(c => c.id === catId)?.name ?? catId }, false);
        toast.success("تم تحديث المصروف بنجاح");
      } else {
        const res = await expensesApi.create(payload);
        const catName = categories.find(c => c.id === catId)?.name ?? catId;
        onSaved({
          id: res?.id ?? `local-${Date.now()}`,
          amount: num,
          description: desc.trim(),
          expenseDate: date,
          date,
          category: catName,
          categoryId: catId,
          vendor: vendor.trim() || undefined,
          notes: notes.trim() || undefined,
          isRecurring: recurring,
        }, true);
        toast.success("تم تسجيل المصروف بنجاح");
      }
      handleClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "حدث خطأ. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل المصروف" : "تسجيل مصروف جديد"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المبلغ ({currency})</Label>
              <Input
                type="number" inputMode="decimal" min={0} step="0.01" placeholder="0.00"
                value={amount} onChange={e => setAmount(e.target.value)}
                className="bg-secondary/50 border-transparent focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input
                type="date" value={date} onChange={e => setDate(e.target.value)}
                className="bg-secondary/50 border-transparent focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>التصنيف <span className="text-destructive">*</span></Label>
            <Select value={catId} onValueChange={v => setCatId(v ?? "")}>
              <SelectTrigger dir="rtl" className="bg-secondary/50 border-transparent focus:ring-primary">
                <SelectValue placeholder="اختر التصنيف..." />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>الوصف <span className="text-destructive">*</span></Label>
            <Input
              placeholder="ما الذي قمت بشرائه؟"
              value={desc} onChange={e => setDesc(e.target.value)}
              className="bg-secondary/50 border-transparent focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>المورد / الجهة</Label>
            <Input
              placeholder="اسم المورد (اختياري)"
              value={vendor} onChange={e => setVendor(e.target.value)}
              className="bg-secondary/50 border-transparent focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Input
              placeholder="ملاحظات إضافية (اختياري)"
              value={notes} onChange={e => setNotes(e.target.value)}
              className="bg-secondary/50 border-transparent focus-visible:ring-primary"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
            <input
              type="checkbox" checked={recurring}
              onChange={e => setRecurring(e.target.checked)}
              className="accent-primary w-4 h-4 rounded"
            />
            مصروف متكرر شهرياً
          </label>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={busy}>إلغاء</Button>
            <Button type="submit" disabled={busy} className="gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {busy ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة المصروف"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── UploadReceiptModal ──────────────────────────────────────────────────────

interface UploadReceiptModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  expense: Expense | null;
  businessId: string;
  userId: string;
  onUploaded: (expenseId: string, url: string) => void;
}

function UploadReceiptModal({ open, onOpenChange, expense, businessId, userId, onUploaded }: UploadReceiptModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleClose = () => {
    if (!busy) { setFile(null); setPreview(null); onOpenChange(false); }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file || !expense) return;
    setBusy(true);
    try {
      const res = await expensesApi.uploadReceipt(expense.id, businessId, userId, file);
      onUploaded(expense.id, res.receiptUrl);
      toast.success("تم رفع الإيصال بنجاح");
      handleClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "فشل رفع الإيصال. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>رفع إيصال</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-4">
          {expense && (
            <p className="text-sm text-muted-foreground">
              المصروف: <span className="text-foreground font-medium">{expense.description}</span>
            </p>
          )}

          {preview ? (
            <div className="relative rounded-lg overflow-hidden border border-border bg-secondary/30 h-48 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="max-h-full max-w-full object-contain" />
              <button
                onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 left-2 bg-background/80 rounded-full p-1 hover:bg-background transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 h-40 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">اضغط لاختيار صورة الإيصال</span>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
            </label>
          )}

          {expense?.receiptUrl && (
            <a
              href={expense.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              عرض الإيصال الحالي
            </a>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={busy}>إلغاء</Button>
          <Button onClick={handleUpload} disabled={!file || busy} className="gap-2">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {busy ? "جاري الرفع..." : "رفع الإيصال"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ExpensesTab() {
  const { businessId, user, currency } = useAuth();
  const userId = user?.id ?? "";
  const curr = currency ?? "AED";
  const apiOn = isApiConfigured() && !!businessId;

  const { data, setData, isLoading } = useFetch<Expense[]>(
    () => expensesApi.list(businessId!),
    { fallback: MOCK_EXPENSES, enabled: apiOn, cacheKey: businessId ?? "mock" },
  );

  const { data: categoriesData } = useFetch<ExpenseCategory[]>(
    () => expensesApi.getCategories(businessId!),
    { fallback: [], enabled: apiOn, cacheKey: `${businessId}-cats` },
  );

  const expenses = data ?? MOCK_EXPENSES;

  const categories = apiOn
    ? (categoriesData ?? []).map((c, i) => ({
        id: c.id,
        name: c.name,
        icon: ICON_CYCLE[i % ICON_CYCLE.length],
        color: COLOR_CYCLE[i % COLOR_CYCLE.length],
      }))
    : MOCK_CATEGORIES;

  // ── modal state ──
  const [createOpen,  setCreateOpen]  = useState(false);
  const [editTarget,  setEditTarget]  = useState<Expense | null>(null);
  const [receiptTarget, setReceiptTarget] = useState<Expense | null>(null);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteBusy,  setDeleteBusy]  = useState(false);

  // ── stats ──
  const totalSpend   = expenses.reduce((s, e) => s + (e.amount ?? 0), 0);
  const avgExpense   = expenses.length ? totalSpend / expenses.length : 0;
  const recurring    = expenses.filter(e => e.isRecurring).length;

  // ── handlers ──
  const handleSaved = (expense: Expense, isNew: boolean) => {
    setData(prev => {
      const list = prev ?? [];
      if (isNew) return [expense, ...list];
      return list.map(e => e.id === expense.id ? expense : e);
    });
  };

  const handleReceiptUploaded = (expenseId: string, url: string) => {
    setData(prev => (prev ?? []).map(e => e.id === expenseId ? { ...e, receiptUrl: url } : e));
  };

  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId === id) {
      handleDeleteConfirm(id);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(prev => prev === id ? null : prev), 3000);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    if (!apiOn) {
      setData(prev => (prev ?? []).filter(e => e.id !== id));
      setDeleteConfirmId(null);
      toast.success("تم حذف المصروف");
      return;
    }
    setDeleteId(id);
    setDeleteBusy(true);
    try {
      await expensesApi.remove(id, businessId!, userId ?? "");
      setData(prev => (prev ?? []).filter(e => e.id !== id));
      setDeleteConfirmId(null);
      toast.success("تم حذف المصروف بنجاح");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "فشل حذف المصروف.");
    } finally {
      setDeleteId(null);
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">إجمالي المصروفات</p>
            <p className="text-2xl font-bold font-mono text-destructive dark:text-red-400">
              {totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-sans font-normal text-muted-foreground ms-1">{curr}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">متوسط المصروف</p>
            <p className="text-2xl font-bold font-mono">
              {avgExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-sans font-normal text-muted-foreground ms-1">{curr}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border col-span-2 md:col-span-1">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">مصروفات متكررة</p>
            <p className="text-2xl font-bold">{recurring}
              <span className="text-sm font-normal text-muted-foreground ms-1">من {expenses.length}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Table card ── */}
      <Card className="shadow-sm border-border overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-destructive dark:text-red-400" />
            <CardTitle className="text-base font-bold">سجل المصروفات</CardTitle>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5 h-9">
            <Plus className="w-4 h-4" />
            مصروف جديد
          </Button>
        </CardHeader>

        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-right text-sm min-w-[max(700px,100%)]">
            <thead className="bg-secondary/50 text-muted-foreground text-xs">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">التاريخ</th>
                <th className="px-5 py-3 font-medium">الوصف</th>
                <th className="px-5 py-3 font-medium">التصنيف</th>
                <th className="px-5 py-3 font-medium">المورد</th>
                <th className="px-5 py-3 font-medium">المبلغ ({curr})</th>
                <th className="px-5 py-3 font-medium text-center">إيصال</th>
                <th className="px-5 py-3 font-medium text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {expenses.map(expense => {
                const cat =
                  categories.find(c => c.id === expense.categoryId || c.id === expense.category || c.name === expense.category) ??
                  categories[categories.length - 1] ??
                  MOCK_CATEGORIES[MOCK_CATEGORIES.length - 1];
                const dateStr = expense.expenseDate ?? expense.date ?? "";
                const isDeleting = deleteBusy && deleteId === expense.id;

                return (
                  <tr key={expense.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {safeFormatDate(dateStr)}
                    </td>
                    <td className="px-5 py-3.5 font-medium max-w-[180px] truncate">
                      <span title={expense.description}>{expense.description}</span>
                      {expense.isRecurring && (
                        <span className="ms-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">متكرر</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${cat.color}`}>
                        <cat.icon className="w-3 h-3 shrink-0" />
                        {cat.name ?? expense.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-sm">
                      {expense.vendor ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-destructive dark:text-red-400 whitespace-nowrap">
                      -{(expense.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => setReceiptTarget(expense)}
                        title={expense.receiptUrl ? "عرض/تعديل الإيصال" : "رفع إيصال"}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-secondary transition-colors"
                      >
                        {expense.receiptUrl
                          ? <Paperclip className="w-4 h-4 text-primary" />
                          : <Upload className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        }
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditTarget(expense)}
                          title="تعديل"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-secondary transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(expense.id)}
                          disabled={isDeleting}
                          title={deleteConfirmId === expense.id ? "اضغط مرة أخرى للتأكيد" : "حذف"}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                            deleteConfirmId === expense.id
                              ? "bg-destructive/10 text-destructive"
                              : "hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          }`}
                        >
                          {isDeleting
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted-foreground py-12">
                    <TrendingDown className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>لم يتم تسجيل مصروفات بعد</p>
                    <Button onClick={() => setCreateOpen(true)} variant="outline" size="sm" className="mt-3 gap-1.5">
                      <Plus className="w-4 h-4" />
                      أضف أول مصروف
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Modals ── */}
      <ExpenseFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
        businessId={businessId ?? ""}
        userId={userId ?? ""}
        currency={curr}
        onSaved={handleSaved}
      />

      <ExpenseFormModal
        open={!!editTarget}
        onOpenChange={o => { if (!o) setEditTarget(null); }}
        categories={categories}
        businessId={businessId ?? ""}
        userId={userId ?? ""}
        currency={curr}
        editing={editTarget ?? undefined}
        onSaved={(expense, isNew) => { handleSaved(expense, isNew); setEditTarget(null); }}
      />

      <UploadReceiptModal
        open={!!receiptTarget}
        onOpenChange={o => { if (!o) setReceiptTarget(null); }}
        expense={receiptTarget}
        businessId={businessId ?? ""}
        userId={userId ?? ""}
        onUploaded={handleReceiptUploaded}
      />
    </div>
  );
}
