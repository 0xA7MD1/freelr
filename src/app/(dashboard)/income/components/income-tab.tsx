"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { arSA } from "date-fns/locale";
import { CalendarDays, Edit2, Loader2, Plus, Search, Trash2, TrendingUp, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import { Textarea } from "@/components/shared/ui/textarea";
import { ApiError, isApiConfigured } from "@/lib/api/client";
import { incomeApi } from "@/lib/api/income";
import { MOCK_INCOME, MOCK_INCOME_CATEGORIES } from "@/lib/api/mocks";
import type { IncomeCategory, IncomeEntry } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { useFetch } from "@/lib/hooks/use-fetch";

function safeFormatDate(value?: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy", { locale: arSA });
  } catch {
    return value;
  }
}

function getIncomeDate(entry: IncomeEntry) {
  return entry.transactionDate ?? entry.incomeDate ?? "";
}

interface IncomeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  userId: string;
  currency: string;
  apiOn: boolean;
  categories: IncomeCategory[];
  categoriesLoading: boolean;
  editing?: IncomeEntry;
  onSaved: (income: IncomeEntry, isNew: boolean) => void;
}

function IncomeFormModal({
  open,
  onOpenChange,
  businessId,
  userId,
  currency,
  apiOn,
  categories,
  categoriesLoading,
  editing,
  onSaved,
}: IncomeFormModalProps) {
  const isEdit = !!editing;
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [description, setDescription] = useState(editing?.description ?? editing?.source ?? "");
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [transactionDate, setTransactionDate] = useState(
    editing ? getIncomeDate(editing).slice(0, 10) : new Date().toISOString().slice(0, 10),
  );
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setAmount("");
    setDescription("");
    setCategoryId("");
    setNotes("");
    setTransactionDate(new Date().toISOString().slice(0, 10));
  };

  const handleClose = () => {
    if (!busy) {
      reset();
      onOpenChange(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const numericAmount = Number.parseFloat(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error("يرجى إدخال مبلغ صالح أكبر من صفر.");
      return;
    }

    if (!description.trim()) {
      toast.error("يرجى إدخال مصدر الدخل.");
      return;
    }

    if (!categoryId.trim()) {
      toast.error("يرجى اختيار تصنيف الدخل.");
      return;
    }

    setBusy(true);
    const selectedCategory = categories.find((category) => category.id === categoryId);
    const payload = {
      businessId,
      amount: numericAmount,
      description: description.trim(),
      transactionDate,
      categoryId,
      notes: notes.trim() || undefined,
    };

    try {
      if (isEdit && editing) {
        if (apiOn) await incomeApi.update(editing.id, { ...payload, updatedBy: userId });
        onSaved(
          {
            ...editing,
            ...payload,
            source: payload.description,
            incomeDate: payload.transactionDate,
            category: selectedCategory?.name ?? editing.category,
            categoryName: selectedCategory?.name ?? editing.categoryName,
          },
          false,
        );
        toast.success("تم تحديث الدخل بنجاح");
      } else {
        const result = apiOn ? await incomeApi.create(payload) : { id: `local-${Date.now()}` };
        onSaved(
          {
            id: result?.id ?? `local-${Date.now()}`,
            amount: numericAmount,
            description: payload.description,
            source: payload.description,
            categoryId: payload.categoryId,
            category: selectedCategory?.name,
            categoryName: selectedCategory?.name,
            transactionDate,
            incomeDate: transactionDate,
            notes: payload.notes,
          },
          true,
        );
        toast.success("تم تسجيل الدخل بنجاح");
      }
      handleClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "حدث خطأ. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل الدخل" : "إضافة دخل جديد"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>المبلغ ({currency})</Label>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="bg-secondary/50 border-transparent focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={transactionDate}
                onChange={(event) => setTransactionDate(event.target.value)}
                className="bg-secondary/50 border-transparent focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>مصدر الدخل <span className="text-destructive">*</span></Label>
            <Input
              placeholder="مثال: ورشة تدريب، بيع منتج، عمولة"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="bg-secondary/50 border-transparent focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>تصنيف الدخل <span className="text-destructive">*</span></Label>
            <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? "")}>
              <SelectTrigger
                dir="rtl"
                className="h-10 w-full bg-secondary/50 border-transparent focus:ring-primary"
                disabled={busy || categoriesLoading || categories.length === 0}
              >
                <SelectValue placeholder={categoriesLoading ? "جاري تحميل التصنيفات..." : "اختر التصنيف"} />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!categoriesLoading && categories.length === 0 && (
              <p className="text-xs text-destructive">لا توجد تصنيفات دخل متاحة لهذا النشاط.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea
              placeholder="أي تفاصيل إضافية عن الدخل"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-24 bg-secondary/50 border-transparent focus-visible:ring-primary"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={busy}>إلغاء</Button>
            <Button type="submit" disabled={busy || categoriesLoading || categories.length === 0} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {busy ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة الدخل"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function IncomeTab() {
  const { businessId, user, currency } = useAuth();
  const userId = user?.id ?? "";
  const curr = currency ?? "AED";
  const apiOn = isApiConfigured() && !!businessId;

  const { data, setData, isLoading } = useFetch<IncomeEntry[]>(
    () => incomeApi.list(businessId!),
    { fallback: MOCK_INCOME, enabled: apiOn, cacheKey: businessId ?? "mock-income" },
  );

  const { data: categoriesData, isLoading: categoriesLoading } = useFetch<IncomeCategory[]>(
    () => incomeApi.getCategories(businessId!),
    {
      fallback: apiOn ? [] : MOCK_INCOME_CATEGORIES,
      enabled: apiOn,
      cacheKey: `${businessId ?? "mock"}-income-categories`,
    },
  );

  const income = data ?? MOCK_INCOME;
  const categories = apiOn ? (categoriesData ?? []) : MOCK_INCOME_CATEGORIES;
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IncomeEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [query, setQuery] = useState("");

  const filteredIncome = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return income;
    return income.filter((entry) => {
      const text = [entry.description, entry.source, entry.notes, entry.clientName, entry.category, entry.categoryName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return text.includes(term);
    });
  }, [income, query]);

  const totalIncome = income.reduce((sum, entry) => sum + (entry.amount ?? 0), 0);
  const averageIncome = income.length ? totalIncome / income.length : 0;
  const latestIncome = income.reduce<IncomeEntry | null>((latest, entry) => {
    if (!latest) return entry;
    return new Date(getIncomeDate(entry)).getTime() > new Date(getIncomeDate(latest)).getTime() ? entry : latest;
  }, null);

  const handleSaved = (entry: IncomeEntry, isNew: boolean) => {
    setData((prev) => {
      const list = prev ?? [];
      if (isNew) return [entry, ...list];
      return list.map((item) => item.id === entry.id ? entry : item);
    });
  };

  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId === id) {
      void handleDeleteConfirm(id);
      return;
    }
    setDeleteConfirmId(id);
    setTimeout(() => setDeleteConfirmId((current) => current === id ? null : current), 3000);
  };

  const handleDeleteConfirm = async (id: string) => {
    if (!apiOn) {
      setData((prev) => (prev ?? []).filter((entry) => entry.id !== id));
      setDeleteConfirmId(null);
      toast.success("تم حذف الدخل");
      return;
    }

    setDeleteId(id);
    setDeleteBusy(true);
    try {
      await incomeApi.remove(id, businessId!, userId);
      setData((prev) => (prev ?? []).filter((entry) => entry.id !== id));
      setDeleteConfirmId(null);
      toast.success("تم حذف الدخل بنجاح");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "فشل حذف الدخل.");
    } finally {
      setDeleteId(null);
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">إجمالي الدخل</p>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-sans font-normal text-muted-foreground ms-1">{curr}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">متوسط الدخل</p>
            <p className="text-2xl font-bold font-mono">
              {averageIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-sans font-normal text-muted-foreground ms-1">{curr}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">عدد العمليات</p>
            <p className="text-2xl font-bold">{income.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">آخر دخل</p>
            <p className="text-sm font-medium truncate">{latestIncome?.description ?? "لا يوجد"}</p>
            <p className="text-xs text-muted-foreground mt-1">{latestIncome ? safeFormatDate(getIncomeDate(latestIncome)) : "-"}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border flex-row items-center justify-between gap-3 space-y-0">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-base font-bold">سجل الدخل</CardTitle>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="بحث"
                className="h-9 w-44 bg-secondary/50 border-transparent pr-9"
              />
            </div>
            <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5 h-9">
              <Plus className="w-4 h-4" />
              دخل جديد
            </Button>
          </div>
        </CardHeader>

        <div className="px-4 pt-4 sm:hidden">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="بحث في الدخل"
              className="bg-secondary/50 border-transparent pr-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-right text-sm min-w-[max(680px,100%)]">
            <thead className="bg-secondary/50 text-muted-foreground text-xs">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">التاريخ</th>
                <th className="px-5 py-3 font-medium">مصدر الدخل</th>
                <th className="px-5 py-3 font-medium">التصنيف</th>
                <th className="px-5 py-3 font-medium">ملاحظات</th>
                <th className="px-5 py-3 font-medium">المبلغ ({curr})</th>
                <th className="px-5 py-3 font-medium text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredIncome.map((entry) => {
                const isDeleting = deleteBusy && deleteId === entry.id;
                return (
                  <tr key={entry.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {safeFormatDate(getIncomeDate(entry))}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <WalletCards className="h-4 w-4" />
                        </span>
                        <span className="font-medium max-w-[220px] truncate" title={entry.description}>
                          {entry.description || entry.source}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground max-w-[240px] truncate">
                      {entry.category ?? entry.categoryName ?? "-"}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground max-w-[240px] truncate">
                      {entry.notes ?? "-"}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      +{(entry.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditTarget(entry)}
                          title="تعديل"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-secondary transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(entry.id)}
                          disabled={isDeleting}
                          title={deleteConfirmId === entry.id ? "اضغط مرة أخرى للتأكيد" : "حذف"}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                            deleteConfirmId === entry.id
                              ? "bg-destructive/10 text-destructive"
                              : "hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          }`}
                        >
                          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredIncome.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted-foreground py-12">
                    <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>{query ? "لا توجد نتائج مطابقة للبحث" : "لم يتم تسجيل دخل بعد"}</p>
                    <Button onClick={() => setCreateOpen(true)} variant="outline" size="sm" className="mt-3 gap-1.5">
                      <Plus className="w-4 h-4" />
                      أضف أول دخل
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <IncomeFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        businessId={businessId ?? ""}
        userId={userId}
        currency={curr}
        apiOn={apiOn}
        categories={categories}
        categoriesLoading={categoriesLoading}
        onSaved={handleSaved}
      />

      <IncomeFormModal
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
        businessId={businessId ?? ""}
        userId={userId}
        currency={curr}
        apiOn={apiOn}
        categories={categories}
        categoriesLoading={categoriesLoading}
        editing={editTarget ?? undefined}
        onSaved={(entry, isNew) => {
          handleSaved(entry, isNew);
          setEditTarget(null);
        }}
      />
    </div>
  );
}
