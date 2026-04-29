"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import {
  Bell, BellOff, ShieldAlert, TrendingDown, FileWarning,
  CreditCard, CheckCircle, Info, Loader2, Trash2, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useFetch } from "@/lib/hooks/use-fetch";
import { alertsApi } from "@/lib/api/alerts";
import { ApiError, isApiConfigured } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import type { Alert } from "@/lib/api/types";

// ─── helpers ────────────────────────────────────────────────────────────────

type SeverityKey = "Info" | "Warning" | "Error" | "Critical";
type AlertTypeKey =
  | "LowBalance" | "OverdueInvoice" | "HighExpense" | "CashflowWarning"
  | "PaymentReceived" | "InvoiceSent" | "General";

const SEVERITY_CONFIG: Record<SeverityKey, { label: string; badgeClass: string; dotClass: string }> = {
  Info:     { label: "معلومة", badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",       dotClass: "bg-blue-500" },
  Warning:  { label: "تحذير",  badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",   dotClass: "bg-amber-500" },
  Error:    { label: "خطأ",    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",           dotClass: "bg-red-500" },
  Critical: { label: "حرج",    badgeClass: "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200 font-bold", dotClass: "bg-red-600 animate-pulse" },
};

const TYPE_CONFIG: Record<AlertTypeKey, { label: string; Icon: typeof Bell; iconBg: string; iconColor: string }> = {
  LowBalance:       { label: "رصيد منخفض",        Icon: CreditCard,    iconBg: "bg-red-500/10",    iconColor: "text-red-500" },
  OverdueInvoice:   { label: "فاتورة متأخرة",      Icon: FileWarning,   iconBg: "bg-amber-500/10",  iconColor: "text-amber-500" },
  HighExpense:      { label: "مصروفات مرتفعة",     Icon: TrendingDown,  iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
  CashflowWarning:  { label: "تحذير تدفق نقدي",   Icon: ShieldAlert,   iconBg: "bg-red-500/10",    iconColor: "text-red-500" },
  PaymentReceived:  { label: "دفعة واردة",          Icon: CheckCircle,   iconBg: "bg-emerald-500/10",iconColor: "text-emerald-500" },
  InvoiceSent:      { label: "فاتورة مُرسلة",      Icon: Bell,          iconBg: "bg-blue-500/10",   iconColor: "text-blue-500" },
  General:          { label: "عام",                Icon: Info,          iconBg: "bg-[#0052FC]/10",  iconColor: "text-[#0052FC]" },
};

function getSeverityConfig(severity: string) {
  return SEVERITY_CONFIG[severity as SeverityKey] ?? SEVERITY_CONFIG.Info;
}

function getTypeConfig(alertType: string) {
  return TYPE_CONFIG[alertType as AlertTypeKey] ?? TYPE_CONFIG.General;
}

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("ar-AE", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// ─── component ──────────────────────────────────────────────────────────────

export function AlertsTab() {
  const { businessId, user } = useAuth();
  const apiOn = isApiConfigured() && !!businessId;
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, setData, isLoading, refetch } = useFetch<Alert[]>(
    () => alertsApi.list(businessId!, unreadOnly),
    { enabled: apiOn, cacheKey: `alerts-${businessId}-${unreadOnly}` },
  );

  const alerts = data ?? [];
  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const handleMarkRead = async (alert: Alert) => {
    if (alert.isRead) return;
    if (apiOn) {
      try {
        await alertsApi.markRead(alert.id, businessId!);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "تعذّر تحديث التنبيه.");
        return;
      }
    }
    setData((prev) =>
      (prev ?? alerts).map((a) => (a.id === alert.id ? { ...a, isRead: true, readAt: new Date().toISOString() } : a)),
    );
  };

  const handleDismiss = async (alert: Alert) => {
    if (apiOn) {
      try {
        await alertsApi.dismiss(alert.id, businessId!, user?.id ?? "");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "تعذّر حذف التنبيه.");
        return;
      }
    }
    setData((prev) => (prev ?? alerts).filter((a) => a.id !== alert.id));
    toast.success("تم حذف التنبيه.");
  };

  const handleMarkAllRead = async () => {
    const unread = alerts.filter((a) => !a.isRead);
    if (unread.length === 0) return;
    if (apiOn) {
      try {
        await Promise.all(unread.map((a) => alertsApi.markRead(a.id, businessId!)));
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "تعذّر تحديث التنبيهات.");
        return;
      }
    }
    setData((prev) => (prev ?? alerts).map((a) => ({ ...a, isRead: true, readAt: new Date().toISOString() })));
    toast.success("تم تحديد الكل كمقروء.");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h2 className="text-2xl font-bold tracking-tight">التنبيهات</h2>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">تنبيهات تلقائية مبنية على أداء مشروعك المالي.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setUnreadOnly((v) => !v); }}
            className={unreadOnly ? "border-[#0052FC] text-[#0052FC]" : ""}
          >
            {unreadOnly ? <Bell className="w-3.5 h-3.5 ml-1.5" /> : <BellOff className="w-3.5 h-3.5 ml-1.5" />}
            {unreadOnly ? "عرض الكل" : "غير المقروءة فقط"}
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <Eye className="w-3.5 h-3.5 ml-1.5" />
              تحديد الكل كمقروء
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <Loader2 className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && alerts.length === 0 && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && alerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">لا توجد تنبيهات</h3>
          <p className="text-sm max-w-xs">
            {unreadOnly ? "لا توجد تنبيهات غير مقروءة حالياً." : "سيتم إنشاء التنبيهات تلقائياً عند رصد أي نشاط مالي يستحق الانتباه."}
          </p>
        </div>
      )}

      {/* Alerts list */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const severityMeta = getSeverityConfig(alert.severity);
            const typeMeta = getTypeConfig(alert.alertType);
            const Icon = typeMeta.Icon;

            return (
              <Card
                key={alert.id}
                className={`border-border shadow-sm transition-all duration-200 ${
                  alert.isRead ? "opacity-60 hover:opacity-80" : "hover:shadow-md"
                }`}
              >
                <CardContent className="p-4 flex gap-4">

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeMeta.iconBg}`}>
                    <Icon className={`w-5 h-5 ${typeMeta.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{typeMeta.label}</span>
                      <Badge variant="outline" className={`text-[10px] px-2 py-0 rounded-full border-0 ${severityMeta.badgeClass}`}>
                        {severityMeta.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{alert.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1.5">{formatDate(alert.createdDate)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    {!alert.isRead && (
                      <>
                        <div className={`w-2.5 h-2.5 rounded-full ${severityMeta.dotClass}`} />
                        <button
                          onClick={() => handleMarkRead(alert)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="تحديد كمقروء"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDismiss(alert)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                      title="حذف التنبيه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
