"use client";

import { useState, useMemo, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { arSA } from "date-fns/locale";
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
import { ApiError, isApiConfigured } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
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

const STATUS_CONFIG: Record<number, { label: string; className: string; icon: React.ReactNode }> = {
  [InvoiceStatus.Draft]:         { label: "مسودة",         className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",           icon: <FileText className="w-3 h-3" /> },
  [InvoiceStatus.Sent]:          { label: "مُرسلة",         className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",             icon: <Mail className="w-3 h-3" /> },
  [InvoiceStatus.Paid]:          { label: "مدفوعة",         className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", icon: <CheckCircle2 className="w-3 h-3" /> },
  [InvoiceStatus.PartiallyPaid]: { label: "مدفوعة جزئياً", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",       icon: <Clock className="w-3 h-3" /> },
  [InvoiceStatus.Overdue]:       { label: "متأخرة",         className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",               icon: <TriangleAlert className="w-3 h-3" /> },
  [InvoiceStatus.Cancelled]:     { label: "ملغاة",          className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",               icon: null },
};

function statusKey(s: InvoiceStatus | string | number): number {
  return typeof s === "string"
    ? (InvoiceStatus[s as keyof typeof InvoiceStatus] ?? 0)
    : Number(s);
}

function getStatus(s: InvoiceStatus | string | number) {
  return STATUS_CONFIG[statusKey(s)] ?? { label: String(s), className: "bg-gray-100 text-gray-500", icon: null };
}

function fmtAmount(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(s: string) {
  try { return format(parseISO(s), "dd MMM yyyy", { locale: arSA }); }
  catch { return s; }
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

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: PaymentMethod.BankTransfer, label: "تحويل بنكي" },
  { value: PaymentMethod.Cash,         label: "نقداً" },
  { value: PaymentMethod.CreditCard,   label: "بطاقة ائتمان" },
  { value: PaymentMethod.DebitCard,    label: "بطاقة مدين" },
  { value: PaymentMethod.PayPal,       label: "PayPal" },
  { value: PaymentMethod.Stripe,       label: "Stripe" },
  { value: PaymentMethod.Crypto,       label: "عملة رقمية" },
  { value: PaymentMethod.Cheque,       label: "شيك" },
  { value: PaymentMethod.Other,        label: "أخرى" },
];

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export function InvoiceTab() {
  const { businessId, user, currency } = useAuth();
  const apiOn = isApiConfigured() && !!businessId;
  const cur = currency ?? "AED";

  const { data, setData, isLoading } = useFetch<Invoice[]>(
    () => invoicesApi.list(businessId!),
    { fallback: MOCK_INVOICES, enabled: apiOn, cacheKey: businessId ?? "mock" },
  );
  const invoices = data ?? MOCK_INVOICES;

  // Modal states
  const [createOpen, setCreateOpen]   = useState(false);
  const [detailId, setDetailId]       = useState<string | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<{ invoiceId: string; balanceDue: number } | null>(null);

  // Table inline delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId]           = useState<string | null>(null);

  const stats = useMemo(() => {
    const count   = invoices.length;
    const total   = invoices.reduce((s, i) => s + i.total, 0);
    const unpaid  = invoices.filter(i => statusKey(i.status) !== InvoiceStatus.Paid && statusKey(i.status) !== InvoiceStatus.Cancelled)
                            .reduce((s, i) => s + i.balanceDue, 0);
    const overdue = invoices.filter(i => statusKey(i.status) === InvoiceStatus.Overdue).length;
    return { count, total, unpaid, overdue };
  }, [invoices]);

  const handleTableDelete = async (inv: Invoice) => {
    setDeletingId(inv.id);
    setConfirmDeleteId(null);
    try {
      if (apiOn) await invoicesApi.delete(inv.id, businessId!, user?.id ?? "");
      setData(prev => (prev ?? []).filter(i => i.id !== inv.id));
      toast.success(`تم حذف الفاتورة ${inv.invoiceNumber}.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "تعذر حذف الفاتورة.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي الفواتير"  value={String(stats.count)}          sub="فاتورة" />
        <StatCard label="الإجمالي الكلي"   value={fmtAmount(stats.total)}       sub={cur} />
        <StatCard label="غير مدفوعة"       value={fmtAmount(stats.unpaid)}      sub={cur} accent="amber" />
        <StatCard label="متأخرة"           value={String(stats.overdue)}        sub="فاتورة" accent="red" />
      </div>

      {/* Invoices table */}
      <Card className="shadow-sm border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center gap-4 flex-wrap">
          <h3 className="font-bold text-base">قائمة الفواتير</h3>
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 bg-[#0052FC] hover:bg-[#0052FC]/90 text-white h-9 px-4 rounded-lg font-bold text-sm"
            >
              <Plus className="w-4 h-4" /> إنشاء فاتورة
            </Button>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Receipt className="w-10 h-10 opacity-30" />
            <p className="text-sm">لا توجد فواتير بعد</p>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> إنشاء أول فاتورة
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-right text-sm whitespace-nowrap min-w-[780px]">
              <thead className="bg-secondary/50 text-muted-foreground text-xs">
                <tr className="border-b border-border">
                  <th className="px-6 py-3 font-medium">رقم الفاتورة</th>
                  <th className="px-6 py-3 font-medium">العميل</th>
                  <th className="px-6 py-3 font-medium">الإصدار</th>
                  <th className="px-6 py-3 font-medium">الاستحقاق</th>
                  <th className="px-6 py-3 font-medium">الإجمالي ({cur})</th>
                  <th className="px-6 py-3 font-medium">الحالة</th>
                  <th className="px-6 py-3 font-medium text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {invoices.map((inv) => {
                  const sm = getStatus(inv.status);
                  const isDeleting    = deletingId === inv.id;
                  const awaitConfirm  = confirmDeleteId === inv.id;

                  return (
                    <tr key={inv.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-[#0052FC]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 font-medium">{inv.clientName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{fmtDate(inv.issueDate)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{fmtDate(inv.dueDate)}</td>
                      <td className="px-6 py-4 font-mono font-bold">{fmtAmount(inv.total)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sm.className}`}>
                          {sm.icon} {sm.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {awaitConfirm ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="destructive" size="sm"
                              className="h-7 px-2.5 text-xs font-bold"
                              onClick={() => handleTableDelete(inv)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "تأكيد"}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
                              onClick={() => setConfirmDeleteId(null)}>
                              إلغاء
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="outline" size="sm"
                              className="h-7 px-3 text-xs font-medium"
                              onClick={() => setDetailId(inv.id)}
                            >
                              عرض
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setConfirmDeleteId(inv.id)}
                              disabled={!!deletingId}
                              aria-label="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
  label, value, sub, accent,
}: {
  label: string; value: string; sub: string; accent?: "amber" | "red";
}) {
  const cls = accent === "red"
    ? "text-red-600 dark:text-red-400"
    : accent === "amber"
    ? "text-amber-600 dark:text-amber-400"
    : "text-foreground";
  return (
    <Card className="shadow-sm border-border">
      <CardContent className="pt-4 pb-4">
        <p className="text-xs text-muted-foreground mb-1 truncate">{label}</p>
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

    if (validItems.length === 0) { toast.error("أضف بنداً واحداً على الأقل بسعر صالح."); return; }

    const clientName = clients.find(c => c.id === clientId)?.fullName ?? clientFallback;
    if (!clientName.trim() && !clientId) { toast.error("يرجى تحديد العميل أو إدخال اسمه."); return; }

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
      toast.success("تم إنشاء الفاتورة.");
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
      toast.success("تم إنشاء الفاتورة بنجاح.");
      resetAndClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "تعذر إنشاء الفاتورة.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) resetAndClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Client */}
          <div className="space-y-2">
            <Label>العميل</Label>
            {apiOn && clients.length > 0 ? (
              <Select value={clientId} onValueChange={v => setClientId(v ?? "")}>
                <SelectTrigger dir="rtl" className="h-10">
                  <SelectValue placeholder={loadingClients ? "جاري التحميل..." : "اختر العميل..."} />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="اسم العميل أو الشركة"
                value={clientFallback}
                onChange={e => setClientFallback(e.target.value)}
                className="h-10"
              />
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تاريخ الإصدار</Label>
              <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>تاريخ الاستحقاق</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-10" />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <Label>بنود الفاتورة</Label>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center bg-secondary/30 rounded-lg p-3">
                <Input
                  placeholder="وصف الخدمة أو المنتج"
                  value={item.desc}
                  onChange={e => handleItemChange(i, "desc", e.target.value)}
                  className="flex-1 h-9 text-sm min-w-0"
                />
                <Input
                  type="number" min={1} placeholder="الكمية"
                  value={item.qty}
                  onChange={e => handleItemChange(i, "qty", e.target.value)}
                  className="w-20 h-9 text-sm shrink-0"
                />
                <div className="relative w-32 shrink-0">
                  <Input
                    type="number" step="0.01" min={0} placeholder="السعر"
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
              <Plus className="w-3.5 h-3.5" /> إضافة بند آخر
            </Button>
          </div>

          {/* Tax + Totals */}
          <div className="flex justify-between items-end gap-4 pt-3 border-t border-border/50">
            <div className="space-y-2 w-36">
              <Label>نسبة الضريبة (%)</Label>
              <Input
                type="number" min={0} max={100}
                value={taxRate} onChange={e => setTaxRate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="text-left space-y-0.5">
              {taxAmt > 0 && (
                <p className="text-xs text-muted-foreground">
                  ضريبة {parseFloat(taxRate)}%: {fmtAmount(taxAmt)} {currency}
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
              إلغاء
            </Button>
            <Button
              type="submit" disabled={saving}
              className="bg-[#0052FC] hover:bg-[#0052FC]/90 text-white h-10 px-6 font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              {saving ? "جاري الحفظ..." : "إنشاء الفاتورة"}
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
  const [invoice, setInvoice]         = useState<Invoice | null>(null);
  const [loading, setLoading]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    setConfirmDelete(false); setSending(false);

    if (!apiOn) {
      setInvoice(MOCK_INVOICES.find(i => i.id === invoiceId) ?? null);
      return;
    }
    setLoading(true);
    invoicesApi.getById(invoiceId, businessId)
      .then(setInvoice)
      .catch(() => toast.error("تعذر تحميل الفاتورة."))
      .finally(() => setLoading(false));
  }, [invoiceId, apiOn, businessId]);

  const handleSend = async () => {
    if (!invoiceId) return;
    setSending(true);
    try {
      if (apiOn) await invoicesApi.send(invoiceId, businessId, userId);
      setInvoice(prev => prev ? { ...prev, status: InvoiceStatus.Sent } : prev);
      onStatusChange(invoiceId, InvoiceStatus.Sent);
      toast.success("تم إرسال الفاتورة للعميل.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "تعذر إرسال الفاتورة.");
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
        setPdfUrl(url);
      } else {
        setPdfUrl(`https://example.com/invoices/${invoiceId}.pdf`);
      }
      toast.success("تم توليد ملف PDF.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "تعذر توليد PDF.");
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
        setQrUrl(qrCodeUrl);
      } else {
        setQrUrl(`https://pay.example.com/inv/${invoiceId}`);
      }
      toast.success("تم توليد رمز QR.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "تعذر توليد رمز QR.");
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
        setPaymentLink(link);
      } else {
        setPaymentLink(`https://pay.example.com/checkout/${invoiceId}`);
      }
      toast.success("تم توليد رابط الدفع.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "تعذر توليد رابط الدفع.");
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
      toast.success("تم حذف الفاتورة.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "تعذر حذف الفاتورة.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const isDraft = invoice ? statusKey(invoice.status) === InvoiceStatus.Draft : false;
  const sm      = invoice ? getStatus(invoice.status) : null;

  return (
    <Dialog open={!!invoiceId} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && !invoice && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            تعذر تحميل بيانات الفاتورة.
          </div>
        )}

        {!loading && invoice && (
          <>
            {/* Header */}
            <DialogHeader>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-1">
                    {invoice.invoiceNumber}
                  </p>
                  <DialogTitle className="text-lg leading-tight">
                    {invoice.clientName}
                  </DialogTitle>
                  {invoice.clientEmail && (
                    <p className="text-xs text-muted-foreground mt-0.5">{invoice.clientEmail}</p>
                  )}
                </div>
                {sm && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${sm.className}`}>
                    {sm.icon} {sm.label}
                  </span>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-5">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">تاريخ الإصدار</p>
                  <p className="font-semibold">{fmtDate(invoice.issueDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">تاريخ الاستحقاق</p>
                  <p className="font-semibold">{fmtDate(invoice.dueDate)}</p>
                </div>
              </div>

              {/* Items table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-muted-foreground text-xs">
                    <tr>
                      <th className="px-4 py-2.5 text-right font-medium">الوصف</th>
                      <th className="px-4 py-2.5 text-center font-medium w-16">الكمية</th>
                      <th className="px-4 py-2.5 text-center font-medium w-24">السعر</th>
                      <th className="px-4 py-2.5 text-left font-medium w-28">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {invoice.items.map((item, i) => (
                      <tr key={i} className="hover:bg-secondary/20">
                        <td className="px-4 py-3 font-medium">{item.description}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{item.quantity}</td>
                        <td className="px-4 py-3 text-center font-mono text-muted-foreground">
                          {fmtAmount(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-left font-mono font-bold">
                          {fmtAmount(item.amount ?? item.quantity * item.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="space-y-2 text-sm min-w-[220px] bg-secondary/20 p-4 rounded-lg">
                  <div className="flex justify-between gap-8">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-mono">{fmtAmount(invoice.subTotal)} {currency}</span>
                  </div>
                  {invoice.taxRate > 0 && (
                    <div className="flex justify-between gap-8">
                      <span className="text-muted-foreground">ضريبة {invoice.taxRate}%</span>
                      <span className="font-mono">{fmtAmount(invoice.taxAmount)} {currency}</span>
                    </div>
                  )}
                  {invoice.paidAmount > 0 && (
                    <div className="flex justify-between gap-8 text-emerald-600 dark:text-emerald-400">
                      <span>المدفوع</span>
                      <span className="font-mono">-{fmtAmount(invoice.paidAmount)} {currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-8 pt-2 border-t border-border font-bold text-base">
                    <span>المتبقي</span>
                    <span className="font-mono text-[#0052FC]">
                      {fmtAmount(invoice.balanceDue)} {currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Action buttons ─────────────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-border/50">
                {/* Send — only for Draft invoices */}
                {isDraft && (
                  <Button variant="outline" size="sm" onClick={handleSend}
                    disabled={sending} className="gap-2 h-9 text-xs">
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    إرسال للعميل
                  </Button>
                )}

                {/* Record Payment */}
                <Button variant="outline" size="sm" className="gap-2 h-9 text-xs"
                  onClick={() => onRequestPayment(invoice.id, invoice.balanceDue)}
                  disabled={invoice.balanceDue <= 0}
                >
                  <CreditCard className="w-3.5 h-3.5" /> تسجيل دفعة
                </Button>

                {/* Generate PDF */}
                <Button variant="outline" size="sm" onClick={handleGeneratePdf}
                  disabled={genPdf} className="gap-2 h-9 text-xs">
                  {genPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  توليد PDF
                </Button>

                {/* Generate QR */}
                <Button variant="outline" size="sm" onClick={handleGenerateQr}
                  disabled={genQr} className="gap-2 h-9 text-xs">
                  {genQr ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
                  رمز QR
                </Button>

                {/* Payment Link */}
                <Button variant="outline" size="sm" onClick={handleGenerateLink}
                  disabled={genLink} className="gap-2 h-9 text-xs">
                  {genLink ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  رابط الدفع
                </Button>

                {/* Delete */}
                {confirmDelete ? (
                  <div className="flex gap-1.5 col-span-full sm:col-span-1">
                    <Button variant="destructive" size="sm" className="flex-1 h-9 text-xs font-bold"
                      onClick={handleDelete} disabled={deleting}>
                      {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "تأكيد الحذف"}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 text-xs"
                      onClick={() => setConfirmDelete(false)}>
                      إلغاء
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm"
                    className="gap-2 h-9 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="w-3.5 h-3.5" /> حذف الفاتورة
                  </Button>
                )}
              </div>

              {/* ── Inline results ─────────────────────────────────────────── */}

              {/* PDF result */}
              {pdfUrl && (
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-0.5">ملف PDF جاهز للتنزيل</p>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline truncate block">{pdfUrl}</a>
                  </div>
                  <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0 text-blue-600"
                    onClick={() => { navigator.clipboard.writeText(pdfUrl); toast.success("تم نسخ الرابط."); }}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

              {/* QR result */}
              {qrUrl && (
                <div className="flex items-center gap-4 bg-secondary/40 border border-border rounded-lg p-4">
                  <div className="bg-white p-3 rounded-lg border border-border shrink-0 shadow-sm">
                    <QRCodeSVG value={qrUrl} size={80} fgColor="#0052FC" level="H" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold mb-1">رمز QR للدفع</p>
                    <p className="text-xs text-muted-foreground break-all">{qrUrl}</p>
                    <Button variant="ghost" size="sm" className="h-7 px-2 mt-2 text-xs gap-1.5"
                      onClick={() => { navigator.clipboard.writeText(qrUrl); toast.success("تم نسخ الرابط."); }}>
                      <Copy className="w-3 h-3" /> نسخ الرابط
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment link result */}
              {paymentLink && (
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-0.5">رابط الدفع جاهز</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">{paymentLink}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0 text-emerald-600"
                    onClick={() => { navigator.clipboard.writeText(paymentLink); toast.success("تم نسخ الرابط."); }}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
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
    if (!Number.isFinite(amtNum) || amtNum <= 0) { toast.error("يرجى إدخال مبلغ صالح."); return; }
    if (amtNum > balanceDue + 0.01) { toast.error(`المبلغ يتجاوز المتبقي (${fmtAmount(balanceDue)} ${currency}).`); return; }

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
      toast.success(`تم تسجيل دفعة بمبلغ ${fmtAmount(amtNum)} ${currency}.`);
      resetAndClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "تعذر تسجيل الدفعة.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) resetAndClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تسجيل دفعة</DialogTitle>
          <p className="text-xs text-muted-foreground">
            المتبقي: <span className="font-bold font-mono text-[#0052FC]">{fmtAmount(balanceDue)} {currency}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Amount */}
          <div className="space-y-2">
            <Label>المبلغ ({currency})</Label>
            <Input
              type="number" step="0.01" min={0.01}
              placeholder={`حد أقصى: ${fmtAmount(balanceDue)}`}
              value={amount} onChange={e => setAmount(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>تاريخ الدفع</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-10" />
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <Label>طريقة الدفع</Label>
            <Select value={method} onValueChange={v => setMethod(v ?? String(PaymentMethod.BankTransfer))}>
              <SelectTrigger dir="rtl" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {PAYMENT_METHOD_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transaction ID */}
          <div className="space-y-2">
            <Label>
              رقم المعاملة{" "}
              <span className="text-muted-foreground text-xs font-normal">(اختياري)</span>
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
              ملاحظات{" "}
              <span className="text-muted-foreground text-xs font-normal">(اختياري)</span>
            </Label>
            <Input
              placeholder="أي ملاحظات..."
              value={notes} onChange={e => setNotes(e.target.value)}
              className="h-10"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose} className="h-10">
              إلغاء
            </Button>
            <Button
              type="submit" disabled={saving}
              className="bg-[#0052FC] hover:bg-[#0052FC]/90 text-white h-10 px-6 font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              {saving ? "جاري الحفظ..." : "تسجيل الدفعة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
