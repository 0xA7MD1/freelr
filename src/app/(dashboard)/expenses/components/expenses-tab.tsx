"use client";

import { useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { arSA, enUS } from "date-fns/locale";
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
import { ApiError, API_BASE_URL, isApiConfigured } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useT, useLanguage } from "@/lib/i18n";
import { ConfirmDeleteDialog } from "@/components/shared/ui/confirm-delete-dialog";
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

function withBaseUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function safeFormatDate(value: string, locale: string) {
  try {
    return format(parseISO(value), "dd MMM yyyy", { locale: locale === "ar" ? arSA : enUS });
  } catch { return value; }
}

// ─── ExpenseFormModal ────────────────────────────────────────────────────────

interface ExpenseFormModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categories: { id: string; name: string }[];
  businessId: string;
  userId: string;
  currency: string;
  editing?: Expense;
  onSaved: (expense: Expense, isNew: boolean) => void;
}

function ExpenseFormModal({
  open, onOpenChange, categories, businessId, userId, currency, editing, onSaved,
}: ExpenseFormModalProps) {
  const t = useT();
  const isEdit = !!editing;

  const [amount,    setAmount]    = useState(editing ? String(editing.amount) : "");
  const [catId,     setCatId]     = useState(editing?.categoryId ?? "");
  const [desc,      setDesc]      = useState(editing?.description ?? "");
  const [vendor,    setVendor]    = useState(editing?.vendor ?? "");
  const [notes,     setNotes]     = useState(editing?.notes ?? "");
  const [recurring, setRecurring] = useState(editing?.isRecurring ?? false);
  const [date,      setDate]      = useState(
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
    if (!Number.isFinite(num) || num <= 0) { toast.error(t("expensesPage.form.amountError")); return; }
    if (!catId || !desc.trim())            { toast.error(t("expensesPage.form.fieldsError")); return; }

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
        toast.success(t("expensesPage.updateSuccess"));
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
        toast.success(t("expensesPage.addSuccess"));
      }
      handleClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("expensesPage.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("expensesPage.form.editTitle") : t("expensesPage.form.addTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("expensesPage.form.amount")} ({currency})</Label>
              <Input
                type="number" inputMode="decimal" min={0} step="0.01" placeholder="0.00"
                value={amount} onChange={e => setAmount(e.target.value)}
                className="bg-secondary/50 border-transparent focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("expensesPage.form.date")}</Label>
              <Input
                type="date" value={date} onChange={e => setDate(e.target.value)}
                className="bg-secondary/50 border-transparent focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("expensesPage.form.category")} <span className="text-destructive">*</span></Label>
            <Select value={catId} onValueChange={v => setCatId(v ?? "")}>
              <SelectTrigger dir="rtl" className="bg-secondary/50 border-transparent focus:ring-primary">
                <span className="flex-1 text-start text-sm truncate" data-slot="select-value">
                  {catId
                    ? (categories.find(c => c.id === catId)?.name ?? catId)
                    : <span className="text-muted-foreground">{t("expensesPage.form.categoryPlaceholder")}</span>
                  }
                </span>
              </SelectTrigger>
              <SelectContent dir="rtl">
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("expensesPage.form.description")} <span className="text-destructive">*</span></Label>
            <Input
              placeholder={t("expensesPage.form.descriptionPlaceholder")}
              value={desc} onChange={e => setDesc(e.target.value)}
              className="bg-secondary/50 border-transparent focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("expensesPage.form.vendor")}</Label>
            <Input
              placeholder={t("expensesPage.form.vendorPlaceholder")}
              value={vendor} onChange={e => setVendor(e.target.value)}
              className="bg-secondary/50 border-transparent focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("expensesPage.form.notes")}</Label>
            <Input
              placeholder={t("expensesPage.form.notesPlaceholder")}
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
            {t("expensesPage.form.isRecurring")}
          </label>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={busy}>
              {t("expensesPage.form.cancel")}
            </Button>
            <Button type="submit" disabled={busy} className="gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {busy
                ? t("expensesPage.form.saving")
                : isEdit
                  ? t("expensesPage.form.save")
                  : t("expensesPage.form.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── ReceiptViewerModal ──────────────────────────────────────────────────────

interface ReceiptViewerModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  expense: Expense | null;
  onReplace: () => void;
}

function ReceiptViewerModal({ open, onOpenChange, expense, onReplace }: ReceiptViewerModalProps) {
  const t = useT();
  if (!expense?.receiptUrl) return null;

  const url = withBaseUrl(expense.receiptUrl);
  const isPdf = url.toLowerCase().includes(".pdf") || url.startsWith("data:application/pdf");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-primary" />
            {t("expensesPage.receipt.viewTitle")}
            {expense.description && (
              <span className="text-muted-foreground font-normal text-sm">— {expense.description}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 py-5 flex items-center justify-center bg-secondary/20 min-h-[300px]">
          {isPdf ? (
            <iframe
              src={url}
              className="w-full h-[60vh] rounded-lg border border-border"
              title="receipt-pdf"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="receipt"
              className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md"
            />
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border shrink-0 flex-row justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 text-xs"
              onClick={() => window.open(url, "_blank")}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t("expensesPage.receipt.openInTab")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 text-xs"
              onClick={() => { onOpenChange(false); onReplace(); }}
            >
              <Upload className="w-3.5 h-3.5" />
              {t("expensesPage.receipt.replace")}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => onOpenChange(false)}>
            {t("expensesPage.receipt.cancel")}
          </Button>
        </DialogFooter>
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
  const t = useT();
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
      toast.success(t("expensesPage.receipt.uploadSuccess"));
      handleClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("expensesPage.receipt.uploadError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("expensesPage.receipt.title")}</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-4">
          {expense && (
            <p className="text-sm text-muted-foreground">
              {t("expensesPage.receipt.expenseLabel")}{" "}
              <span className="text-foreground font-medium">{expense.description}</span>
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
              <span className="text-sm text-muted-foreground">{t("expensesPage.receipt.chooseFile")}</span>
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
              {t("expensesPage.receipt.viewCurrent")}
            </a>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={busy}>
            {t("expensesPage.receipt.cancel")}
          </Button>
          <Button onClick={handleUpload} disabled={!file || busy} className="gap-2">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {busy ? t("expensesPage.receipt.uploading") : t("expensesPage.receipt.upload")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ExpensesTab() {
  const { businessId, user, currency } = useAuth();
  const t = useT();
  const { locale } = useLanguage();
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

  const [createOpen,      setCreateOpen]      = useState(false);
  const [editTarget,      setEditTarget]      = useState<Expense | null>(null);
  const [receiptTarget,   setReceiptTarget]   = useState<Expense | null>(null);
  const [viewerTarget,    setViewerTarget]    = useState<Expense | null>(null);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteBusy,  setDeleteBusy]  = useState(false);

  const totalSpend = expenses.reduce((s, e) => s + (e.amount ?? 0), 0);
  const avgExpense = expenses.length ? totalSpend / expenses.length : 0;
  const recurring  = expenses.filter(e => e.isRecurring).length;

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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    if (!apiOn) {
      setData(prev => (prev ?? []).filter(e => e.id !== id));
      setDeleteTarget(null);
      toast.success(t("expensesPage.deleteSuccess"));
      return;
    }
    setDeleteId(id);
    setDeleteBusy(true);
    try {
      await expensesApi.remove(id, businessId!, userId ?? "");
      setData(prev => (prev ?? []).filter(e => e.id !== id));
      setDeleteTarget(null);
      toast.success(t("expensesPage.deleteSuccess"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("expensesPage.deleteError"));
    } finally {
      setDeleteId(null);
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteBusy}
      />

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">{t("expensesPage.totalLabel")}</p>
            <p className="text-2xl font-bold font-mono text-destructive dark:text-red-400">
              {totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-sans font-normal text-muted-foreground ms-1">{curr}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">{t("expensesPage.avgLabel")}</p>
            <p className="text-2xl font-bold font-mono">
              {avgExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-sans font-normal text-muted-foreground ms-1">{curr}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border col-span-2 md:col-span-1">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">{t("expensesPage.recurringLabel")}</p>
            <p className="text-2xl font-bold">
              {recurring}
              <span className="text-sm font-normal text-muted-foreground ms-1">
                {t("expensesPage.recurringOf", { total: String(expenses.length) })}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Table card ── */}
      <Card className="shadow-sm border-border overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-destructive dark:text-red-400" />
            <CardTitle className="text-base font-bold">{t("expensesPage.tableTitle")}</CardTitle>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5 h-9">
            <Plus className="w-4 h-4" />
            {t("expensesPage.addNew")}
          </Button>
        </CardHeader>

        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-right text-sm min-w-[max(700px,100%)]">
            <thead className="bg-secondary/50 text-muted-foreground text-xs">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">{t("expensesPage.table.date")}</th>
                <th className="px-5 py-3 font-medium">{t("expensesPage.table.description")}</th>
                <th className="px-5 py-3 font-medium">{t("expensesPage.table.category")}</th>
                <th className="px-5 py-3 font-medium">{t("expensesPage.table.vendor")}</th>
                <th className="px-5 py-3 font-medium">{t("expensesPage.table.amount")} ({curr})</th>
                <th className="px-5 py-3 font-medium text-center">{t("expensesPage.table.receipt")}</th>
                <th className="px-5 py-3 font-medium text-center">{t("expensesPage.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {expenses.map(expense => {
                const cat =
                  categories.find(c => c.id === expense.categoryId || c.id === expense.category || c.name === expense.category) ??
                  categories[categories.length - 1] ??
                  MOCK_CATEGORIES[MOCK_CATEGORIES.length - 1];
                const dateStr    = expense.expenseDate ?? expense.date ?? "";
                const isDeleting = deleteBusy && deleteId === expense.id;

                return (
                  <tr key={expense.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {safeFormatDate(dateStr, locale)}
                    </td>
                    <td className="px-5 py-3.5 font-medium max-w-[180px] truncate">
                      <span title={expense.description}>{expense.description}</span>
                      {expense.isRecurring && (
                        <span className="ms-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                          {t("expensesPage.recurringBadge")}
                        </span>
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
                        onClick={() => expense.receiptUrl ? setViewerTarget(expense) : setReceiptTarget(expense)}
                        title={expense.receiptUrl ? t("expensesPage.receipt.viewEdit") : t("expensesPage.receipt.uploadTooltip")}
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
                          title={t("expensesPage.editTooltip")}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-secondary transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(expense.id)}
                          disabled={isDeleting}
                          title={t("expensesPage.deleteTooltip")}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
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
                    <p>{t("expensesPage.noExpenses")}</p>
                    <Button onClick={() => setCreateOpen(true)} variant="outline" size="sm" className="mt-3 gap-1.5">
                      <Plus className="w-4 h-4" />
                      {t("expensesPage.addFirst")}
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
        userId={userId}
        currency={curr}
        onSaved={handleSaved}
      />

      <ExpenseFormModal
        open={!!editTarget}
        onOpenChange={o => { if (!o) setEditTarget(null); }}
        categories={categories}
        businessId={businessId ?? ""}
        userId={userId}
        currency={curr}
        editing={editTarget ?? undefined}
        onSaved={(expense, isNew) => { handleSaved(expense, isNew); setEditTarget(null); }}
      />

      <ReceiptViewerModal
        open={!!viewerTarget}
        onOpenChange={o => { if (!o) setViewerTarget(null); }}
        expense={viewerTarget}
        onReplace={() => { setReceiptTarget(viewerTarget); setViewerTarget(null); }}
      />

      <UploadReceiptModal
        open={!!receiptTarget}
        onOpenChange={o => { if (!o) setReceiptTarget(null); }}
        expense={receiptTarget}
        businessId={businessId ?? ""}
        userId={userId}
        onUploaded={handleReceiptUploaded}
      />
    </div>
  );
}
