"use client";

import { useState, useMemo, useEffect } from "react";
import { DataPagination } from "@/components/shared/ui/data-pagination";
import { usePagination } from "@/lib/hooks/use-pagination";
import { format, parseISO } from "date-fns";
import { arSA, enUS } from "date-fns/locale";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
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
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  Pencil,
  Plus,
  QrCode,
  Receipt,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { useFetch } from "@/lib/hooks/use-fetch";
import { invoicesApi } from "@/lib/api/invoices";
import { clientsApi } from "@/lib/api/clients";
import { ApiError, API_BASE_URL, isApiConfigured } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useT, useLanguage } from "@/lib/i18n";
import { ConfirmDeleteDialog } from "@/components/shared/ui/confirm-delete-dialog";
import { InvoiceStatus, PaymentMethod } from "@/lib/api/types";
import type {
  Client,
  CreateInvoicePayload,
  Invoice,
  RecordPaymentPayload,
} from "@/lib/api/types";

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-001",
    clientName: "شركة الأمل للتجارة",
    clientEmail: "info@alamal.com",
    status: InvoiceStatus.Paid,
    issueDate: "2026-04-01",
    dueDate: "2026-05-01",
    subTotal: 4500,
    taxRate: 0,
    taxAmount: 0,
    total: 4500,
    paidAmount: 4500,
    balanceDue: 0,
    items: [
      { description: "تصميم هوية بصرية", quantity: 1, unitPrice: 3000, amount: 3000 },
      { description: "تصميم موقع إلكتروني", quantity: 1, unitPrice: 1500, amount: 1500 },
    ],
    payments: [],
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-002",
    clientName: "مؤسسة رؤية المستقبل",
    clientEmail: "contact@ruya.com",
    status: InvoiceStatus.Overdue,
    issueDate: "2026-03-15",
    dueDate: "2026-04-15",
    subTotal: 2200,
    taxRate: 5,
    taxAmount: 110,
    total: 2310,
    paidAmount: 0,
    balanceDue: 2310,
    items: [
      { description: "استشارة تسويقية شهرية", quantity: 1, unitPrice: 2200, amount: 2200 },
    ],
    payments: [],
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2026-003",
    clientName: "خالد الحربي",
    status: InvoiceStatus.Draft,
    issueDate: "2026-04-20",
    dueDate: "2026-05-20",
    subTotal: 1800,
    taxRate: 0,
    taxAmount: 0,
    total: 1800,
    paidAmount: 0,
    balanceDue: 1800,
    items: [
      { description: "تطوير تطبيق جوال", quantity: 1, unitPrice: 1800, amount: 1800 },
    ],
    payments: [],
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2026-004",
    clientName: "ليلى يوسف",
    status: InvoiceStatus.Sent,
    issueDate: "2026-04-22",
    dueDate: "2026-05-22",
    subTotal: 3200,
    taxRate: 10,
    taxAmount: 320,
    total: 3520,
    paidAmount: 0,
    balanceDue: 3520,
    items: [
      { description: "إدارة حملات إعلانية", quantity: 2, unitPrice: 1600, amount: 3200 },
    ],
    payments: [],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<number, { labelKey: string; className: string; icon: React.ReactNode }> = {
  [InvoiceStatus.Draft]:         { labelKey: "invoicesPage.status.Draft",         className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",           icon: <FileText className="w-3 h-3" /> },
  [InvoiceStatus.Sent]:          { labelKey: "invoicesPage.status.Sent",          className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",             icon: <Mail className="w-3 h-3" /> },
  [InvoiceStatus.Paid]:          { labelKey: "invoicesPage.status.Paid",          className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", icon: <CheckCircle2 className="w-3 h-3" /> },
  [InvoiceStatus.PartiallyPaid]: { labelKey: "invoicesPage.status.PartiallyPaid", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",       icon: <Clock className="w-3 h-3" /> },
  [InvoiceStatus.Overdue]:       { labelKey: "invoicesPage.status.Overdue",       className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",               icon: <TriangleAlert className="w-3 h-3" /> },
  [InvoiceStatus.Cancelled]:     { labelKey: "invoicesPage.status.Cancelled",     className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",               icon: null },
};

function statusKey(s: InvoiceStatus | string | number): number {
  return typeof s === "string"
    ? (InvoiceStatus[s as keyof typeof InvoiceStatus] ?? 0)
    : Number(s);
}

function getStatus(s: InvoiceStatus | string | number) {
  return STATUS_CONFIG[statusKey(s)] ?? { labelKey: String(s), className: "bg-gray-100 text-gray-500", icon: null };
}

function fmtAmount(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(s: string, locale = "ar") {
  try { return format(parseISO(s), "dd MMM yyyy", { locale: locale === "ar" ? arSA : enUS }); }
  catch { return s; }
}

function withBaseUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

interface DraftItem { desc: string; qty: string; unitPrice: string; }
const EMPTY_ITEM: DraftItem = { desc: "", qty: "1", unitPrice: "" };

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; labelKey: string }[] = [
  { value: PaymentMethod.BankTransfer, labelKey: "invoicesPage.payment.methods.BankTransfer" },
  { value: PaymentMethod.Cash,         labelKey: "invoicesPage.payment.methods.Cash" },
  { value: PaymentMethod.CreditCard,   labelKey: "invoicesPage.payment.methods.CreditCard" },
  { value: PaymentMethod.DebitCard,    labelKey: "invoicesPage.payment.methods.DebitCard" },
  { value: PaymentMethod.PayPal,       labelKey: "invoicesPage.payment.methods.PayPal" },
  { value: PaymentMethod.Stripe,       labelKey: "invoicesPage.payment.methods.Stripe" },
  { value: PaymentMethod.Crypto,       labelKey: "invoicesPage.payment.methods.Crypto" },
  { value: PaymentMethod.Cheque,       labelKey: "invoicesPage.payment.methods.Cheque" },
  { value: PaymentMethod.Other,        labelKey: "invoicesPage.payment.methods.Other" },
];

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export function InvoiceTab() {
  const { businessId, user, currency } = useAuth();
  const t = useT();
  const { locale } = useLanguage();
  const apiOn = isApiConfigured() && !!businessId;
  const cur = currency ?? "AED";

  const { data, setData, isLoading } = useFetch<Invoice[]>(
    () => invoicesApi.list(businessId!),
    { fallback: MOCK_INVOICES, enabled: apiOn, cacheKey: businessId ?? "mock" },
  );
  const invoices = data ?? MOCK_INVOICES;

  const pg = usePagination(invoices, 10);

  // Modal states
  const [createOpen, setCreateOpen]   = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [detailId, setDetailId]       = useState<string | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<{ invoiceId: string; balanceDue: number } | null>(null);

  // Table delete
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  const stats = useMemo(() => {
    const count   = invoices.length;
    const total   = invoices.reduce((s, i) => s + i.total, 0);
    const unpaid  = invoices.filter(i => statusKey(i.status) !== InvoiceStatus.Paid && statusKey(i.status) !== InvoiceStatus.Cancelled)
                            .reduce((s, i) => s + i.balanceDue, 0);
    const overdue = invoices.filter(i => statusKey(i.status) === InvoiceStatus.Overdue).length;
    return { count, total, unpaid, overdue };
  }, [invoices]);

  const handleTableDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      if (apiOn) await invoicesApi.delete(deleteTarget.id, businessId!, user?.id ?? "");
      setData(prev => (prev ?? []).filter(i => i.id !== deleteTarget.id));
      toast.success(t("invoicesPage.deleteSuccess", { number: deleteTarget.invoiceNumber }));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("invoicesPage.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleTableDelete}
        loading={!!deletingId}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t("invoicesPage.stats.total")}      value={String(stats.count)}     sub={t("invoicesPage.stats.invoiceUnit")} Icon={Receipt}        iconColors="bg-[#0052FC]/10 text-[#0052FC]" />
        <StatCard label={t("invoicesPage.stats.grandTotal")} value={fmtAmount(stats.total)}  sub={cur}                                  Icon={CreditCard} />
        <StatCard label={t("invoicesPage.stats.unpaid")}     value={fmtAmount(stats.unpaid)} sub={cur}                          accent="amber" Icon={Clock} />
        <StatCard label={t("invoicesPage.stats.overdue")}    value={String(stats.overdue)}   sub={t("invoicesPage.stats.invoiceUnit")} accent="red" Icon={TriangleAlert} />
      </div>

      {/* Invoices table */}
      <Card className="shadow-sm border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-[#0052FC]" />
            <h3 className="font-bold text-base">{t("invoicesPage.listTitle")}</h3>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 bg-[#0052FC] hover:bg-[#0052FC]/90 text-white h-9 px-4 rounded-lg font-bold text-sm"
            >
              <Plus className="w-4 h-4" /> {t("invoicesPage.createNew")}
            </Button>
          </div>
        </div>

        {pg.total === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Receipt className="w-10 h-10 opacity-30" />
            <p className="text-sm">{t("invoicesPage.noInvoices")}</p>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> {t("invoicesPage.addFirst")}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-right text-sm whitespace-nowrap min-w-[780px]">
              <thead className="bg-secondary/50 text-muted-foreground text-xs">
                <tr className="border-b border-border">
                  <th className="px-6 py-3 font-medium">{t("invoicesPage.table.invoiceNumber")}</th>
                  <th className="px-6 py-3 font-medium">{t("invoicesPage.table.client")}</th>
                  <th className="px-6 py-3 font-medium">{t("invoicesPage.table.issueDate")}</th>
                  <th className="px-6 py-3 font-medium">{t("invoicesPage.table.dueDate")}</th>
                  <th className="px-6 py-3 font-medium">{t("invoicesPage.table.total")} ({cur})</th>
                  <th className="px-6 py-3 font-medium">{t("invoicesPage.table.status")}</th>
                  <th className="px-6 py-3 font-medium text-center">{t("invoicesPage.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {pg.paged.map((inv) => {
                  const sm = getStatus(inv.status);
                  const isDeleting = deletingId === inv.id;

                  return (
                    <tr key={inv.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-[#0052FC]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 font-medium">{inv.clientName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{fmtDate(inv.issueDate, locale)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{fmtDate(inv.dueDate, locale)}</td>
                      <td className="px-6 py-4 font-mono font-bold">{fmtAmount(inv.total)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sm.className}`}>
                          {sm.icon} {t(sm.labelKey)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="outline" size="sm"
                              className="h-7 px-3 text-xs font-medium"
                              onClick={() => setDetailId(inv.id)}
                            >
                              {t("invoicesPage.table.view")}
                            </Button>
                            {statusKey(inv.status) === InvoiceStatus.Draft && (
                              <Button
                                variant="ghost" size="icon"
                                className="w-7 h-7 text-muted-foreground hover:text-[#0052FC] hover:bg-[#0052FC]/10"
                                onClick={() => setEditInvoice(inv)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost" size="icon"
                              className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget(inv)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <DataPagination
          page={pg.page}
          totalPages={pg.totalPages}
          total={pg.total}
          from={pg.from}
          to={pg.to}
          pageSize={pg.pageSize}
          onPageChange={pg.goTo}
          onPageSizeChange={pg.changePageSize}
        />
      </Card>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <CreateInvoiceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        businessId={businessId ?? ""}
        userId={user?.id ?? ""}
        apiOn={apiOn}
        currency={cur}
        onCreated={(inv) => setData(prev => [inv, ...(prev ?? [])])}
      />

      <EditInvoiceModal
        invoice={editInvoice}
        onClose={() => setEditInvoice(null)}
        currency={cur}
        onUpdated={(updated) =>
          setData(prev => (prev ?? []).map(i => i.id === updated.id ? updated : i))
        }
      />

      <InvoiceDetailModal
        invoiceId={detailId}
        businessId={businessId ?? ""}
        userId={user?.id ?? ""}
        apiOn={apiOn}
        currency={cur}
        onClose={() => setDetailId(null)}
        onDeleted={(id) => {
          setData(prev => (prev ?? []).filter(i => i.id !== id));
          setDetailId(null);
        }}
        onStatusChange={(id, newStatus) =>
          setData(prev => (prev ?? []).map(i =>
            i.id === id ? { ...i, status: newStatus } : i,
          ))
        }
        onRequestPayment={(invoiceId, balanceDue) =>
          setPaymentTarget({ invoiceId, balanceDue })
        }
      />

      <RecordPaymentModal
        open={!!paymentTarget}
        invoiceId={paymentTarget?.invoiceId ?? ""}
        businessId={businessId ?? ""}
        userId={user?.id ?? ""}
        apiOn={apiOn}
        currency={cur}
        balanceDue={paymentTarget?.balanceDue ?? 0}
        onClose={() => setPaymentTarget(null)}
        onRecorded={(amount) => {
          if (!paymentTarget) return;
          setData(prev => (prev ?? []).map(i => {
            if (i.id !== paymentTarget.invoiceId) return i;
            const newPaid    = i.paidAmount + amount;
            const newBalance = Math.max(0, i.balanceDue - amount);
            return {
              ...i,
              paidAmount:  newPaid,
              balanceDue:  newBalance,
              status: newBalance <= 0 ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid,
            };
          }));
          setPaymentTarget(null);
        }}
      />
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent, Icon, iconColors,
}: {
  label: string; value: string; sub: string; accent?: "amber" | "red";
  Icon?: React.ComponentType<{ className?: string }>;
  iconColors?: string;
}) {
  const cls = accent === "red"
    ? "text-red-600 dark:text-red-400"
    : accent === "amber"
    ? "text-amber-600 dark:text-amber-400"
    : "text-foreground";
  const ic = iconColors ?? (
    accent === "red"   ? "bg-red-500/10 text-red-500" :
    accent === "amber" ? "bg-amber-500/10 text-amber-500" :
    "bg-secondary text-muted-foreground"
  );
  return (
    <Card className="shadow-sm border-border">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs text-muted-foreground truncate pe-2">{label}</p>
          {Icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ic}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        <p className={`text-xl font-bold font-mono truncate ${cls}`}>{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── CreateInvoiceModal ───────────────────────────────────────────────────────

function CreateInvoiceModal({
  open, onClose, businessId, userId, apiOn, currency, onCreated,
}: {
  open: boolean;
  onClose: () => void;
  businessId: string;
  userId: string;
  apiOn: boolean;
  currency: string;
  onCreated: (inv: Invoice) => void;
}) {
  const t = useT();
  const { locale } = useLanguage();
  const [clients, setClients]               = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientId, setClientId]             = useState("");
  const [clientFallback, setClientFallback] = useState("");
  const [issueDate, setIssueDate]           = useState(todayStr);
  const [dueDate, setDueDate]               = useState(() => addDays(todayStr(), 30));
  const [taxRate, setTaxRate]               = useState("0");
  const [items, setItems]                   = useState<DraftItem[]>([EMPTY_ITEM]);
  const [saving, setSaving]                 = useState(false);

  useEffect(() => {
    if (!open || !apiOn) return;
    setLoadingClients(true);
    clientsApi.list(businessId)
      .then(setClients)
      .catch(() => {})
      .finally(() => setLoadingClients(false));
  }, [open, apiOn, businessId]);

  const subTotal = useMemo(() =>
    items.reduce((s, it) => s + (parseFloat(it.qty) || 1) * (parseFloat(it.unitPrice) || 0), 0),
    [items],
  );
  const taxAmt    = subTotal * (parseFloat(taxRate) || 0) / 100;
  const grandTotal = subTotal + taxAmt;

  const handleItemChange = (idx: number, field: keyof DraftItem, val: string) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));

  const resetAndClose = () => {
    setClientId(""); setClientFallback(""); setIssueDate(todayStr());
    setDueDate(addDays(todayStr(), 30)); setTaxRate("0"); setItems([EMPTY_ITEM]);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items
      .map(it => ({
        description: it.desc.trim(),
        quantity:    parseFloat(it.qty) || 1,
        unitPrice:   parseFloat(it.unitPrice),
      }))
      .filter(it => it.description && Number.isFinite(it.unitPrice) && it.unitPrice > 0);

    if (validItems.length === 0) { toast.error(t("invoicesPage.create.validItemsError")); return; }

    const clientName = clients.find(c => c.id === clientId)?.fullName ?? clientFallback;
    if (!clientName.trim() && !clientId) { toast.error(t("invoicesPage.create.clientError")); return; }

    const optimistic: Invoice = {
      id:            `local-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      clientName,
      status:        InvoiceStatus.Draft,
      issueDate,
      dueDate,
      subTotal,
      taxRate:       parseFloat(taxRate) || 0,
      taxAmount:     taxAmt,
      total:         grandTotal,
      paidAmount:    0,
      balanceDue:    grandTotal,
      items:         validItems.map(it => ({ ...it, amount: it.quantity * it.unitPrice })),
    };

    if (!apiOn || !clientId) {
      onCreated(optimistic);
      toast.success(t("invoicesPage.create.createSuccess"));
      resetAndClose();
      return;
    }

    setSaving(true);
    try {
      const payload: CreateInvoicePayload = {
        businessId, clientId, issueDate, dueDate,
        taxRate: parseFloat(taxRate) || 0,
        items:   validItems,
      };
      const { id } = await invoicesApi.create(payload);
      onCreated({ ...optimistic, id });
      toast.success(t("invoicesPage.create.createSuccessApi"));
      resetAndClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("invoicesPage.create.createError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) resetAndClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("invoicesPage.create.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Client */}
          <div className="space-y-2">
            <Label>{t("invoicesPage.create.clientLabel")}</Label>
            {apiOn && clients.length > 0 ? (
              <Select value={clientId} onValueChange={v => setClientId(v ?? "")}>
                <SelectTrigger dir={locale === "ar" ? "rtl" : "ltr"} className="h-10">
                  <span className="flex-1 text-start text-sm truncate" data-slot="select-value">
                    {clientId
                      ? (() => { const c = clients.find(x => x.id === clientId); return c ? (c.fullName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()) : clientId; })()
                      : <span className="text-muted-foreground">{loadingClients ? t("invoicesPage.create.loadingClients") : t("invoicesPage.create.clientPlaceholder")}</span>
                    }
                  </span>
                </SelectTrigger>
                <SelectContent dir={locale === "ar" ? "rtl" : "ltr"}>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fullName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || c.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder={t("invoicesPage.create.clientFallbackPlaceholder")}
                value={clientFallback}
                onChange={e => setClientFallback(e.target.value)}
                className="h-10"
              />
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("invoicesPage.create.issueDateLabel")}</Label>
              <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>{t("invoicesPage.create.dueDateLabel")}</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-10" />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <Label>{t("invoicesPage.create.itemsLabel")}</Label>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center bg-secondary/30 rounded-lg p-3">
                <Input
                  placeholder={t("invoicesPage.create.serviceDesc")}
                  value={item.desc}
                  onChange={e => handleItemChange(i, "desc", e.target.value)}
                  className="flex-1 h-9 text-sm min-w-0"
                />
                <Input
                  type="number" min={1} placeholder={t("invoicesPage.create.qtyPlaceholder")}
                  value={item.qty}
                  onChange={e => handleItemChange(i, "qty", e.target.value)}
                  className="w-20 h-9 text-sm shrink-0"
                />
                <div className="relative w-32 shrink-0">
                  <Input
                    type="number" step="0.01" min={0} placeholder={t("invoicesPage.create.pricePlaceholder")}
                    value={item.unitPrice}
                    onChange={e => handleItemChange(i, "unitPrice", e.target.value)}
                    className="h-9 text-sm pl-10"
                  />
                  <span className="absolute left-2.5 top-2 text-[10px] text-muted-foreground font-bold">
                    {currency}
                  </span>
                </div>
                <Button
                  type="button" variant="ghost" size="icon"
                  className="w-8 h-8 text-destructive/60 hover:text-destructive shrink-0"
                  onClick={() => setItems(prev => prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button" variant="outline" size="sm"
              onClick={() => setItems(prev => [...prev, EMPTY_ITEM])}
              className="w-full border-dashed gap-2 text-muted-foreground h-9"
            >
              <Plus className="w-3.5 h-3.5" /> {t("invoicesPage.create.addItem")}
            </Button>
          </div>

          {/* Tax + Totals */}
          <div className="flex justify-between items-end gap-4 pt-3 border-t border-border/50">
            <div className="space-y-2 w-36">
              <Label>{t("invoicesPage.create.taxRate")}</Label>
              <Input
                type="number" min={0} max={100}
                value={taxRate} onChange={e => setTaxRate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="text-left space-y-0.5">
              {taxAmt > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("invoicesPage.create.tax", { rate: String(parseFloat(taxRate)) })}: {fmtAmount(taxAmt)} {currency}
                </p>
              )}
              <p className="text-2xl font-bold font-mono text-[#0052FC]">
                {fmtAmount(grandTotal)}{" "}
                <span className="text-base font-medium text-muted-foreground">{currency}</span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose} className="h-10">
              {t("invoicesPage.create.cancel")}
            </Button>
            <Button
              type="submit" disabled={saving}
              className="bg-[#0052FC] hover:bg-[#0052FC]/90 text-white h-10 px-6 font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              {saving ? t("invoicesPage.create.saving") : t("invoicesPage.create.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── EditInvoiceModal ─────────────────────────────────────────────────────────

function EditInvoiceModal({
  invoice, onClose, currency, onUpdated,
}: {
  invoice: Invoice | null;
  onClose: () => void;
  currency: string;
  onUpdated: (inv: Invoice) => void;
}) {
  const t = useT();
  const { locale } = useLanguage();
  const [clientFallback, setClientFallback] = useState("");
  const [issueDate, setIssueDate]           = useState(todayStr);
  const [dueDate, setDueDate]               = useState(() => addDays(todayStr(), 30));
  const [taxRate, setTaxRate]               = useState("0");
  const [items, setItems]                   = useState<DraftItem[]>([EMPTY_ITEM]);
  const [saving, setSaving]                 = useState(false);

  // Populate form whenever the invoice changes
  useEffect(() => {
    if (!invoice) return;
    setClientFallback(invoice.clientName ?? "");
    setIssueDate(invoice.issueDate);
    setDueDate(invoice.dueDate);
    setTaxRate(String(invoice.taxRate ?? 0));
    setItems(
      invoice.items.length > 0
        ? invoice.items.map(it => ({
            desc:      it.description,
            qty:       String(it.quantity),
            unitPrice: String(it.unitPrice),
          }))
        : [EMPTY_ITEM],
    );
  }, [invoice]);

  const subTotal = useMemo(() =>
    items.reduce((s, it) => s + (parseFloat(it.qty) || 1) * (parseFloat(it.unitPrice) || 0), 0),
    [items],
  );
  const taxAmt     = subTotal * (parseFloat(taxRate) || 0) / 100;
  const grandTotal = subTotal + taxAmt;

  const handleItemChange = (idx: number, field: keyof DraftItem, val: string) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    const validItems = items
      .map(it => ({
        description: it.desc.trim(),
        quantity:    parseFloat(it.qty) || 1,
        unitPrice:   parseFloat(it.unitPrice),
      }))
      .filter(it => it.description && Number.isFinite(it.unitPrice) && it.unitPrice > 0);

    if (validItems.length === 0) { toast.error(t("invoicesPage.create.validItemsError")); return; }

    const clientName = clientFallback.trim();
    if (!clientName) { toast.error(t("invoicesPage.create.clientError")); return; }

    setSaving(true);
    try {
      const updated: Invoice = {
        ...invoice,
        clientName,
        issueDate,
        dueDate,
        taxRate:    parseFloat(taxRate) || 0,
        taxAmount:  taxAmt,
        subTotal,
        total:      grandTotal,
        balanceDue: Math.max(0, grandTotal - invoice.paidAmount),
        items:      validItems.map(it => ({ ...it, amount: it.quantity * it.unitPrice })),
      };
      onUpdated(updated);
      toast.success(t("invoicesPage.create.createSuccess"));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!invoice} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("invoicesPage.edit.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Client — always text input; invoice carries clientName string, not clientId */}
          <div className="space-y-2">
            <Label>{t("invoicesPage.create.clientLabel")}</Label>
            <Input
              placeholder={t("invoicesPage.create.clientFallbackPlaceholder")}
              value={clientFallback}
              onChange={e => setClientFallback(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("invoicesPage.create.issueDateLabel")}</Label>
              <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>{t("invoicesPage.create.dueDateLabel")}</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-10" />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <Label>{t("invoicesPage.create.itemsLabel")}</Label>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center bg-secondary/30 rounded-lg p-3">
                <Input
                  placeholder={t("invoicesPage.create.serviceDesc")}
                  value={item.desc}
                  onChange={e => handleItemChange(i, "desc", e.target.value)}
                  className="flex-1 h-9 text-sm min-w-0"
                />
                <Input
                  type="number" min={1} placeholder={t("invoicesPage.create.qtyPlaceholder")}
                  value={item.qty}
                  onChange={e => handleItemChange(i, "qty", e.target.value)}
                  className="w-20 h-9 text-sm shrink-0"
                />
                <div className="relative w-32 shrink-0">
                  <Input
                    type="number" step="0.01" min={0} placeholder={t("invoicesPage.create.pricePlaceholder")}
                    value={item.unitPrice}
                    onChange={e => handleItemChange(i, "unitPrice", e.target.value)}
                    className="h-9 text-sm pl-10"
                  />
                  <span className="absolute left-2.5 top-2 text-[10px] text-muted-foreground font-bold">
                    {currency}
                  </span>
                </div>
                <Button
                  type="button" variant="ghost" size="icon"
                  className="w-8 h-8 text-destructive/60 hover:text-destructive shrink-0"
                  onClick={() => setItems(prev => prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button" variant="outline" size="sm"
              onClick={() => setItems(prev => [...prev, EMPTY_ITEM])}
              className="w-full border-dashed gap-2 text-muted-foreground h-9"
            >
              <Plus className="w-3.5 h-3.5" /> {t("invoicesPage.create.addItem")}
            </Button>
          </div>

          {/* Tax + Totals */}
          <div className="flex justify-between items-end gap-4 pt-3 border-t border-border/50">
            <div className="space-y-2 w-36">
              <Label>{t("invoicesPage.create.taxRate")}</Label>
              <Input
                type="number" min={0} max={100}
                value={taxRate} onChange={e => setTaxRate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="text-left space-y-0.5">
              {taxAmt > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("invoicesPage.create.tax", { rate: String(parseFloat(taxRate)) })}: {fmtAmount(taxAmt)} {currency}
                </p>
              )}
              <p className="text-2xl font-bold font-mono text-[#0052FC]">
                {fmtAmount(grandTotal)}{" "}
                <span className="text-base font-medium text-muted-foreground">{currency}</span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="h-10">
              {t("invoicesPage.create.cancel")}
            </Button>
            <Button
              type="submit" disabled={saving}
              className="bg-[#0052FC] hover:bg-[#0052FC]/90 text-white h-10 px-6 font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              {saving ? t("invoicesPage.create.saving") : t("invoicesPage.edit.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── InvoiceDetailModal ───────────────────────────────────────────────────────

function InvoiceDetailModal({
  invoiceId, businessId, userId, apiOn, currency,
  onClose, onDeleted, onStatusChange, onRequestPayment,
}: {
  invoiceId: string | null;
  businessId: string;
  userId: string;
  apiOn: boolean;
  currency: string;
  onClose: () => void;
  onDeleted: (id: string) => void;
  onStatusChange: (id: string, status: InvoiceStatus) => void;
  onRequestPayment: (invoiceId: string, balanceDue: number) => void;
}) {
  const t = useT();
  const { locale } = useLanguage();
  const [invoice, setInvoice]         = useState<Invoice | null>(null);
  const [loading, setLoading]         = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Action loading states
  const [sending, setSending]         = useState(false);
  const [genPdf, setGenPdf]           = useState(false);
  const [genQr, setGenQr]             = useState(false);
  const [genLink, setGenLink]         = useState(false);
  const [deleting, setDeleting]       = useState(false);

  // Inline results
  const [pdfUrl, setPdfUrl]           = useState<string | null>(null);
  const [qrUrl, setQrUrl]             = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) { setInvoice(null); return; }
    setPdfUrl(null); setQrUrl(null); setPaymentLink(null);
    setConfirmDeleteOpen(false); setSending(false);

    if (!apiOn) {
      setInvoice(MOCK_INVOICES.find(i => i.id === invoiceId) ?? null);
      return;
    }
    setLoading(true);
    invoicesApi.getById(invoiceId, businessId)
      .then(setInvoice)
      .catch(() => toast.error(t("invoicesPage.detail.loadError")))
      .finally(() => setLoading(false));
  }, [invoiceId, apiOn, businessId]);

  const handleSend = async () => {
    if (!invoiceId) return;
    setSending(true);
    try {
      if (apiOn) await invoicesApi.send(invoiceId, businessId, userId);
      setInvoice(prev => prev ? { ...prev, status: InvoiceStatus.Sent } : prev);
      onStatusChange(invoiceId, InvoiceStatus.Sent);
      toast.success(t("invoicesPage.detail.sendSuccess"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("invoicesPage.detail.sendError"));
    } finally {
      setSending(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!invoiceId) return;
    setGenPdf(true);
    try {
      if (apiOn) {
        const { pdfUrl: url } = await invoicesApi.generatePdf(invoiceId, businessId, userId);
        setPdfUrl(withBaseUrl(url));
      } else {
        setPdfUrl(`https://example.com/invoices/${invoiceId}.pdf`);
      }
      toast.success(t("invoicesPage.detail.pdfSuccess"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("invoicesPage.detail.pdfError"));
    } finally {
      setGenPdf(false);
    }
  };

  const handleGenerateQr = async () => {
    if (!invoiceId) return;
    setGenQr(true);
    try {
      if (apiOn) {
        const { qrCodeUrl } = await invoicesApi.generateQr(invoiceId, businessId, userId);
        setQrUrl(withBaseUrl(qrCodeUrl));
      } else {
        setQrUrl(`https://pay.example.com/inv/${invoiceId}`);
      }
      toast.success(t("invoicesPage.detail.qrSuccess"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("invoicesPage.detail.qrError"));
    } finally {
      setGenQr(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!invoiceId) return;
    setGenLink(true);
    try {
      if (apiOn) {
        const { paymentLink: link } = await invoicesApi.generatePaymentLink(invoiceId, businessId, userId);
        setPaymentLink(withBaseUrl(link));
      } else {
        setPaymentLink(`https://pay.example.com/checkout/${invoiceId}`);
      }
      toast.success(t("invoicesPage.detail.linkSuccess"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("invoicesPage.detail.linkError"));
    } finally {
      setGenLink(false);
    }
  };

  const handleDelete = async () => {
    if (!invoiceId) return;
    setDeleting(true);
    try {
      if (apiOn) await invoicesApi.delete(invoiceId, businessId, userId);
      onDeleted(invoiceId);
      toast.success(t("invoicesPage.detail.deleteSuccess"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("invoicesPage.detail.deleteError"));
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  const isDraft = invoice ? statusKey(invoice.status) === InvoiceStatus.Draft : false;
  const sm      = invoice ? getStatus(invoice.status) : null;

  return (
    <>
    <ConfirmDeleteDialog
      open={confirmDeleteOpen}
      onClose={() => setConfirmDeleteOpen(false)}
      onConfirm={handleDelete}
      loading={deleting}
    />
    <Dialog open={!!invoiceId} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="w-screen max-w-none sm:max-w-none sm:w-[95vw] lg:w-[80vw] xl:w-[70vw] max-h-[95vh] p-0 overflow-hidden flex flex-col rounded-2xl">

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error */}
        {!loading && !invoice && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {t("invoicesPage.detail.loadDataError")}
          </div>
        )}

        {!loading && invoice && (
          <div className="flex flex-col h-full overflow-hidden">

            {/* ── Top header bar ── */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#0052FC]/10 flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5 text-[#0052FC]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-mono text-muted-foreground">{invoice.invoiceNumber}</p>
                  <DialogTitle className="text-base font-bold leading-tight truncate">{invoice.clientName}</DialogTitle>
                  {invoice.clientEmail && (
                    <p className="text-xs text-muted-foreground truncate">{invoice.clientEmail}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {sm && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${sm.className}`}>
                    {sm.icon}{t(sm.labelKey)}
                  </span>
                )}
              </div>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Dates strip */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/40 rounded-xl border border-border/50 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{t("invoicesPage.detail.issueDateLabel")}</p>
                  <p className="font-bold text-base">{fmtDate(invoice.issueDate, locale)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{t("invoicesPage.detail.dueDateLabel")}</p>
                  <p className="font-bold text-base">{fmtDate(invoice.dueDate, locale)}</p>
                </div>
              </div>

              {/* Items table */}
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-muted-foreground text-xs">
                    <tr>
                      <th className="px-5 py-3 text-start font-semibold">{t("invoicesPage.detail.descriptionCol")}</th>
                      <th className="px-5 py-3 text-center font-semibold w-20">{t("invoicesPage.detail.qtyCol")}</th>
                      <th className="px-5 py-3 text-end font-semibold w-28">{t("invoicesPage.detail.priceCol")}</th>
                      <th className="px-5 py-3 text-end font-semibold w-28">{t("invoicesPage.detail.totalCol")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {invoice.items.map((item, i) => (
                      <tr key={i} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-5 py-3.5 font-medium">{item.description}</td>
                        <td className="px-5 py-3.5 text-center text-muted-foreground">{item.quantity}</td>
                        <td className="px-5 py-3.5 text-end font-mono text-muted-foreground">{fmtAmount(item.unitPrice)}</td>
                        <td className="px-5 py-3.5 text-end font-mono font-bold">{fmtAmount(item.amount ?? item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full sm:w-80 bg-secondary/30 rounded-xl border border-border/50 overflow-hidden">
                  <div className="divide-y divide-border/40 text-sm px-5 py-1">
                    <div className="flex justify-between py-2.5">
                      <span className="text-muted-foreground">{t("invoicesPage.detail.subtotal")}</span>
                      <span className="font-mono font-medium">{fmtAmount(invoice.subTotal)} <span className="text-muted-foreground text-xs">{currency}</span></span>
                    </div>
                    {invoice.taxRate > 0 && (
                      <div className="flex justify-between py-2.5">
                        <span className="text-muted-foreground">{t("invoicesPage.detail.tax", { rate: String(invoice.taxRate) })}</span>
                        <span className="font-mono font-medium">{fmtAmount(invoice.taxAmount)} <span className="text-muted-foreground text-xs">{currency}</span></span>
                      </div>
                    )}
                    {invoice.paidAmount > 0 && (
                      <div className="flex justify-between py-2.5 text-emerald-600 dark:text-emerald-400">
                        <span>{t("invoicesPage.detail.paid")}</span>
                        <span className="font-mono font-medium">-{fmtAmount(invoice.paidAmount)} <span className="text-xs opacity-70">{currency}</span></span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center px-5 py-3.5 bg-[#0052FC]/5 border-t border-[#0052FC]/20">
                    <span className="font-bold text-sm">{t("invoicesPage.detail.remaining")}</span>
                    <span className="font-mono font-black text-xl text-[#0052FC]">
                      {fmtAmount(invoice.balanceDue)} <span className="text-sm font-semibold">{currency}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Inline results ── */}
              {pdfUrl && (
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl p-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">{t("invoicesPage.detail.pdfReady")}</p>
                    <p className="text-xs text-blue-600/70 truncate mb-2">{pdfUrl}</p>
                    <div className="flex items-center gap-2">
                      <a
                        href={pdfUrl}
                        download={`${invoice?.invoiceNumber ?? "invoice"}.pdf`}
                        className="inline-flex items-center gap-1.5 h-7 px-3 text-xs font-medium rounded-md border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        {t("invoicesPage.detail.generatePdf")}
                      </a>
                      <button
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-blue-600 hover:bg-blue-100 transition-colors"
                        onClick={() => { navigator.clipboard.writeText(pdfUrl); toast.success(t("invoicesPage.detail.copySuccess")); }}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {qrUrl && (
                <div className="flex items-center gap-5 bg-secondary/40 border border-border rounded-xl p-5">
                  <div className="bg-white p-2.5 rounded-xl border border-border shrink-0 shadow-sm">
                    <QRCodeSVG value={qrUrl} size={88} fgColor="#0052FC" level="H" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold mb-1">{t("invoicesPage.detail.qrReady")}</p>
                    <p className="text-xs text-muted-foreground break-all leading-relaxed">{qrUrl}</p>
                    <Button variant="outline" size="sm" className="h-7 px-3 mt-3 text-xs gap-1.5"
                      onClick={() => { navigator.clipboard.writeText(qrUrl); toast.success(t("invoicesPage.detail.copySuccess")); }}>
                      <Copy className="w-3 h-3" /> {t("invoicesPage.detail.copyLink")}
                    </Button>
                  </div>
                </div>
              )}

              {paymentLink && (
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-0.5">{t("invoicesPage.detail.linkReady")}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">{paymentLink}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0 text-emerald-600 hover:bg-emerald-100"
                    onClick={() => { navigator.clipboard.writeText(paymentLink); toast.success(t("invoicesPage.detail.copySuccess")); }}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* ── Actions footer ── */}
            <div className="shrink-0 border-t border-border bg-secondary/20 px-6 py-4">
              <div className="flex flex-wrap gap-2">
                {isDraft && (
                  <Button variant="outline" size="sm" onClick={handleSend} disabled={sending}
                    className="gap-2 h-9 text-xs">
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    {t("invoicesPage.detail.send")}
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-2 h-9 text-xs"
                  onClick={() => onRequestPayment(invoice.id, invoice.balanceDue)}
                  disabled={invoice.balanceDue <= 0}>
                  <CreditCard className="w-3.5 h-3.5" />{t("invoicesPage.detail.recordPayment")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleGeneratePdf} disabled={genPdf}
                  className="gap-2 h-9 text-xs">
                  {genPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  {t("invoicesPage.detail.generatePdf")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleGenerateQr} disabled={genQr}
                  className="gap-2 h-9 text-xs">
                  {genQr ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
                  {t("invoicesPage.detail.generateQr")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleGenerateLink} disabled={genLink}
                  className="gap-2 h-9 text-xs">
                  {genLink ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  {t("invoicesPage.detail.paymentLink")}
                </Button>

                <div className="flex-1" />

                <Button variant="ghost" size="sm"
                  className="gap-2 h-9 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmDeleteOpen(true)}>
                  <Trash2 className="w-3.5 h-3.5" />{t("invoicesPage.detail.deleteBtn")}
                </Button>
              </div>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

// ─── RecordPaymentModal ───────────────────────────────────────────────────────

function RecordPaymentModal({
  open, onClose, invoiceId, businessId, userId, apiOn, currency, balanceDue, onRecorded,
}: {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
  businessId: string;
  userId: string;
  apiOn: boolean;
  currency: string;
  balanceDue: number;
  onRecorded: (amount: number) => void;
}) {
  const t = useT();
  const { locale } = useLanguage();
  const [amount, setAmount]           = useState("");
  const [date, setDate]               = useState(todayStr);
  const [method, setMethod]           = useState(String(PaymentMethod.BankTransfer));
  const [transactionId, setTransId]   = useState("");
  const [notes, setNotes]             = useState("");
  const [saving, setSaving]           = useState(false);

  const resetAndClose = () => {
    setAmount(""); setDate(todayStr()); setMethod(String(PaymentMethod.BankTransfer));
    setTransId(""); setNotes("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(amount);
    if (!Number.isFinite(amtNum) || amtNum <= 0) { toast.error(t("invoicesPage.payment.amountError")); return; }
    if (amtNum > balanceDue + 0.01) { toast.error(t("invoicesPage.payment.exceedsError", { max: fmtAmount(balanceDue), currency })); return; }

    setSaving(true);
    try {
      if (apiOn) {
        const payload: RecordPaymentPayload = {
          invoiceId,
          businessId,
          amount:        amtNum,
          paymentDate:   date,
          paymentMethod: parseInt(method) as PaymentMethod,
          transactionId: transactionId.trim() || undefined,
          notes:         notes.trim() || undefined,
          updatedBy:     userId,
        };
        await invoicesApi.recordPayment(invoiceId, payload);
      }
      onRecorded(amtNum);
      toast.success(t("invoicesPage.payment.success", { amount: fmtAmount(amtNum), currency }));
      resetAndClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("invoicesPage.payment.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) resetAndClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("invoicesPage.payment.title")}</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {t("invoicesPage.payment.balanceDue")} <span className="font-bold font-mono text-[#0052FC]">{fmtAmount(balanceDue)} {currency}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Amount */}
          <div className="space-y-2">
            <Label>{t("invoicesPage.payment.amount")} ({currency})</Label>
            <Input
              type="number" step="0.01" min={0.01}
              placeholder={t("invoicesPage.payment.amountPlaceholder", { max: fmtAmount(balanceDue) })}
              value={amount} onChange={e => setAmount(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>{t("invoicesPage.payment.date")}</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-10" />
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <Label>{t("invoicesPage.payment.method")}</Label>
            <Select value={method} onValueChange={v => setMethod(v ?? String(PaymentMethod.BankTransfer))}>
              <SelectTrigger dir={locale === "ar" ? "rtl" : "ltr"} className="h-10">
                <span className="flex-1 text-start text-sm truncate" data-slot="select-value">
                  {(() => { const opt = PAYMENT_METHOD_OPTIONS.find(o => String(o.value) === method); return opt ? t(opt.labelKey) : t("invoicesPage.payment.methodPlaceholder"); })()}
                </span>
              </SelectTrigger>
              <SelectContent dir={locale === "ar" ? "rtl" : "ltr"}>
                {PAYMENT_METHOD_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={String(opt.value)}>{t(opt.labelKey)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transaction ID */}
          <div className="space-y-2">
            <Label>
              {t("invoicesPage.payment.transactionId")}{" "}
              <span className="text-muted-foreground text-xs font-normal">{t("invoicesPage.payment.optional")}</span>
            </Label>
            <Input
              dir="ltr" placeholder="TXN-XXXXXXXX"
              value={transactionId} onChange={e => setTransId(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>
              {t("invoicesPage.payment.notes")}{" "}
              <span className="text-muted-foreground text-xs font-normal">{t("invoicesPage.payment.optional")}</span>
            </Label>
            <Input
              placeholder=""
              value={notes} onChange={e => setNotes(e.target.value)}
              className="h-10"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose} className="h-10">
              {t("invoicesPage.payment.cancel")}
            </Button>
            <Button
              type="submit" disabled={saving}
              className="bg-[#0052FC] hover:bg-[#0052FC]/90 text-white h-10 px-6 font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              {saving ? t("invoicesPage.payment.saving") : t("invoicesPage.payment.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
