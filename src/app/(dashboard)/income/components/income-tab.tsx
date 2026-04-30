"use client";

import { useMemo, useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { arSA, enUS } from "date-fns/locale";
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
} from "@/components/shared/ui/select";
import { Textarea } from "@/components/shared/ui/textarea";
import { ApiError, isApiConfigured } from "@/lib/api/client";
import { incomeApi } from "@/lib/api/income";
import { clientsApi } from "@/lib/api/clients";
import { MOCK_INCOME, MOCK_INCOME_CATEGORIES, MOCK_CLIENTS } from "@/lib/api/mocks";
import type { Client, IncomeCategory, IncomeEntry } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { useFetch } from "@/lib/hooks/use-fetch";
import { useT, useLanguage } from "@/lib/i18n";
import { ConfirmDeleteDialog } from "@/components/shared/ui/confirm-delete-dialog";

function safeFormatDate(value: string | undefined, locale: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy", { locale: locale === "ar" ? arSA : enUS });
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
  t: (key: string, params?: Record<string, string | number>) => string;
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
  t,
}: IncomeFormModalProps) {
  const { locale } = useLanguage();
  const isEdit = !!editing;
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  // Sync form fields whenever the entry being edited changes
  useEffect(() => {
    if (editing) {
      setAmount(String(editing.amount));
      setDescription(editing.description ?? editing.source ?? "");
      setCategoryId(editing.categoryId ?? "");
      setClientId(editing.clientId ?? "");
      setNotes(editing.notes ?? "");
      setTransactionDate(getIncomeDate(editing).slice(0, 10));
    } else {
      setAmount("");
      setDescription("");
      setCategoryId("");
      setClientId("");
      setNotes("");
      setTransactionDate(new Date().toISOString().slice(0, 10));
    }
  }, [editing]);

  useEffect(() => {
    if (!open) return;
    if (!apiOn) { setClients(MOCK_CLIENTS); return; }
    setClientsLoading(true);
    clientsApi.list(businessId)
      .then(setClients)
      .catch(() => {})
      .finally(() => setClientsLoading(false));
  }, [open, apiOn, businessId]);

  const reset = () => {
    setAmount("");
    setDescription("");
    setCategoryId("");
    setClientId("");
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
      toast.error(t("incomePage.amountError"));
      return;
    }

    if (!description.trim()) {
      toast.error(t("incomePage.sourceError"));
      return;
    }

    if (!categoryId.trim()) {
      toast.error(t("incomePage.categoryError"));
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
      clientId: clientId || undefined,
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
            clientId: payload.clientId,
          },
          false,
        );
        toast.success(t("incomePage.updateSuccess"));
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
            clientId: payload.clientId,
            transactionDate,
            incomeDate: transactionDate,
            notes: payload.notes,
          },
          true,
        );
        toast.success(t("incomePage.addSuccess"));
      }
      handleClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("incomePage.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("incomePage.form.editTitle") : t("incomePage.form.addTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("incomePage.form.amount")} ({currency})</Label>
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
              <Label>{t("incomePage.form.date")}</Label>
              <Input
                type="date"
                value={transactionDate}
                onChange={(event) => setTransactionDate(event.target.value)}
                className="bg-secondary/50 border-transparent focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("incomePage.form.source")} <span className="text-destructive">*</span></Label>
            <Input
              placeholder={t("incomePage.form.sourcePlaceholder")}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="bg-secondary/50 border-transparent focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("incomePage.form.category")} <span className="text-destructive">*</span></Label>
            <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? "")}>
              <SelectTrigger
                dir={locale === "ar" ? "rtl" : "ltr"}
                className="h-10 w-full bg-secondary/50 border-transparent focus:ring-primary"
                disabled={busy || categoriesLoading || categories.length === 0}
              >
                <span className="flex-1 text-start text-sm truncate" data-slot="select-value">
                  {categoryId
                    ? (categories.find(c => c.id === categoryId)?.name ?? categoryId)
                    : <span className="text-muted-foreground">{categoriesLoading ? t("incomePage.form.loadingCategories") : t("incomePage.form.categoryPlaceholder")}</span>
                  }
                </span>
              </SelectTrigger>
              <SelectContent dir={locale === "ar" ? "rtl" : "ltr"}>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!categoriesLoading && categories.length === 0 && (
              <p className="text-xs text-destructive">{t("incomePage.form.noCategories")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("incomePage.form.client")} <span className="text-muted-foreground text-xs font-normal">{t("incomePage.form.clientOptional")}</span></Label>
            <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")}>
              <SelectTrigger dir={locale === "ar" ? "rtl" : "ltr"} className="h-10 w-full bg-secondary/50 border-transparent focus:ring-primary">
                <span className="flex-1 text-start text-sm truncate" data-slot="select-value">
                  {clientId
                    ? (() => {
                        const c = clients.find((x) => x.id === clientId);
                        return c ? (c.fullName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || clientId) : clientId;
                      })()
                    : <span className="text-muted-foreground">{clientsLoading ? t("incomePage.form.loadingClients") : t("incomePage.form.noClient")}</span>
                  }
                </span>
              </SelectTrigger>
              <SelectContent dir={locale === "ar" ? "rtl" : "ltr"}>
                <SelectItem value="">{t("incomePage.form.noClient")}</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fullName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("incomePage.form.notes")}</Label>
            <Textarea
              placeholder={t("incomePage.form.notesPlaceholder")}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-24 bg-secondary/50 border-transparent focus-visible:ring-primary"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={busy}>{t("incomePage.form.cancel")}</Button>
            <Button type="submit" disabled={busy || categoriesLoading || categories.length === 0} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {busy ? t("incomePage.form.saving") : isEdit ? t("incomePage.form.save") : t("incomePage.form.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function IncomeTab() {
  const { businessId, user, currency } = useAuth();
  const t = useT();
  const { locale } = useLanguage();
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
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    if (!apiOn) {
      setData((prev) => (prev ?? []).filter((entry) => entry.id !== id));
      setDeleteTarget(null);
      toast.success(t("incomePage.deleteSuccess"));
      return;
    }

    setDeleteId(id);
    setDeleteBusy(true);
    try {
      await incomeApi.remove(id, businessId!, userId);
      setData((prev) => (prev ?? []).filter((entry) => entry.id !== id));
      setDeleteTarget(null);
      toast.success(t("incomePage.deleteSuccess"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("incomePage.deleteError"));
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">{t("incomePage.stats.total")}</p>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-sans font-normal text-muted-foreground ms-1">{curr}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">{t("incomePage.stats.average")}</p>
            <p className="text-2xl font-bold font-mono">
              {averageIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-sans font-normal text-muted-foreground ms-1">{curr}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">{t("incomePage.stats.count")}</p>
            <p className="text-2xl font-bold">{income.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">{t("incomePage.stats.latest")}</p>
            <p className="text-sm font-medium truncate">{latestIncome?.description ?? t("incomePage.stats.noLatest")}</p>
            <p className="text-xs text-muted-foreground mt-1">{latestIncome ? safeFormatDate(getIncomeDate(latestIncome), locale) : "-"}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border flex-row items-center justify-between gap-3 space-y-0">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-base font-bold">{t("incomePage.tableTitle")}</CardTitle>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("incomePage.search")}
                className="h-9 w-44 bg-secondary/50 border-transparent pr-9"
              />
            </div>
            <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5 h-9">
              <Plus className="w-4 h-4" />
              {t("incomePage.addNew")}
            </Button>
          </div>
        </CardHeader>

        <div className="px-4 pt-4 sm:hidden">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("incomePage.searchMobile")}
              className="bg-secondary/50 border-transparent pr-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-right text-sm min-w-[max(680px,100%)]">
            <thead className="bg-secondary/50 text-muted-foreground text-xs">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">{t("incomePage.table.date")}</th>
                <th className="px-5 py-3 font-medium">{t("incomePage.table.source")}</th>
                <th className="px-5 py-3 font-medium">{t("incomePage.table.category")}</th>
                <th className="px-5 py-3 font-medium">{t("incomePage.table.notes")}</th>
                <th className="px-5 py-3 font-medium">{t("incomePage.table.amount")} ({curr})</th>
                <th className="px-5 py-3 font-medium text-center">{t("incomePage.table.actions")}</th>
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
                        {safeFormatDate(getIncomeDate(entry), locale)}
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
                          title={t("incomePage.editTooltip")}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-secondary transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(entry.id)}
                          disabled={isDeleting}
                          title={t("incomePage.deleteTooltip")}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
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
                    <p>{query ? t("incomePage.noSearchResults") : t("incomePage.noEntries")}</p>
                    <Button onClick={() => setCreateOpen(true)} variant="outline" size="sm" className="mt-3 gap-1.5">
                      <Plus className="w-4 h-4" />
                      {t("incomePage.addFirst")}
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
        t={t}
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
        t={t}
      />
    </div>
  );
}
