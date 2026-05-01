"use client";

import { useState } from "react";
import { DataPagination } from "@/components/shared/ui/data-pagination";
import { usePagination } from "@/lib/hooks/use-pagination";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import {
  Bell, BellOff, CheckCircle2, AlertCircle, Info,
  Mail, MessageSquare, Smartphone, Trash2, Eye, Loader2, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useFetch } from "@/lib/hooks/use-fetch";
import { notificationsApi } from "@/lib/api/notifications";
import { ApiError, isApiConfigured } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useT } from "@/lib/i18n";
import { ConfirmDeleteDialog } from "@/components/shared/ui/confirm-delete-dialog";
import type { NotificationApi } from "@/lib/api/types";

function priorityMeta(priority?: string) {
  switch (priority?.toLowerCase()) {
    case "urgent":   return { dot: "bg-red-500 animate-pulse", icon: AlertCircle, iconClass: "text-red-500",     bg: "bg-red-500/10" };
    case "high":     return { dot: "bg-orange-500",            icon: AlertCircle, iconClass: "text-orange-500",  bg: "bg-orange-500/10" };
    case "normal":   return { dot: "bg-[#0052FC]",             icon: Info,        iconClass: "text-[#0052FC]",   bg: "bg-[#0052FC]/10" };
    default:         return { dot: "bg-slate-400",             icon: Info,        iconClass: "text-slate-400",   bg: "bg-slate-400/10" };
  }
}

function channelIcon(type?: string) {
  switch (type) {
    case "Email": return Mail;
    case "Sms":   return MessageSquare;
    case "Push":  return Smartphone;
    default:      return Bell;
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Intl.DateTimeFormat("ar-AE", {
      day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
    }).format(new Date(dateStr));
  } catch { return dateStr; }
}

export function NotificationsTab() {
  const { user } = useAuth();
  const userId = user?.id;
  const apiOn = isApiConfigured() && !!userId;
  const t = useT();

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NotificationApi | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const { data, setData, isLoading, refetch } = useFetch<NotificationApi[]>(
    () => notificationsApi.listRaw(userId!, unreadOnly),
    { enabled: apiOn, cacheKey: `notifs-${userId}-${unreadOnly}` },
  );

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const pg = usePagination(notifications, 10);

  const handleMarkRead = async (n: NotificationApi) => {
    if (n.isRead) return;
    if (apiOn) {
      try { await notificationsApi.markRead(n.id, userId!); }
      catch (err) { toast.error(err instanceof ApiError ? err.message : t("notifications.updateError")); return; }
    }
    setData((prev) => (prev ?? []).map((item) =>
      item.id === n.id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item,
    ));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    if (apiOn) {
      try { await notificationsApi.delete(deleteTarget.id, userId!); }
      catch (err) {
        toast.error(err instanceof ApiError ? err.message : t("notifications.deleteError"));
        setDeleteBusy(false);
        return;
      }
    }
    setData((prev) => (prev ?? []).filter((item) => item.id !== deleteTarget.id));
    toast.success(t("notifications.deleteSuccess"));
    setDeleteTarget(null);
    setDeleteBusy(false);
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    if (apiOn) {
      try { await notificationsApi.markAllRead(userId!); }
      catch (err) { toast.error(err instanceof ApiError ? err.message : t("notifications.markAllError")); return; }
    }
    setData((prev) => (prev ?? []).map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
    toast.success(t("notifications.markAllSuccess"));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteBusy}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h2 className="text-2xl font-bold tracking-tight">{t("notifications.title")}</h2>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0052FC] text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{t("notifications.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setUnreadOnly((v) => !v)}
            className={unreadOnly ? "border-[#0052FC] text-[#0052FC]" : ""}>
            {unreadOnly ? <Bell className="w-3.5 h-3.5 ml-1.5" /> : <BellOff className="w-3.5 h-3.5 ml-1.5" />}
            {unreadOnly ? t("common.showAll") : t("common.unread")}
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAll}>
              <Eye className="w-3.5 h-3.5 ml-1.5" />{t("common.markAll")}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <Loader2 className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isLoading && notifications.length === 0 && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">{t("notifications.noNotifications")}</h3>
          <p className="text-sm max-w-xs">
            {unreadOnly ? t("notifications.noUnreadNotifications") : t("notifications.noNotificationsDesc")}
          </p>
        </div>
      )}

      {pg.total > 0 && (
        <div className="space-y-3">
          {pg.paged.map((n) => {
            const meta = priorityMeta(n.priority);
            const Icon = meta.icon;
            const ChannelIcon = channelIcon(n.type);
            return (
              <Card key={n.id}
                className={`border-border shadow-sm transition-all duration-200 ${n.isRead ? "opacity-60 hover:opacity-80" : "hover:shadow-md"}`}>
                <CardContent className="p-4 flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <Icon className={`w-5 h-5 ${meta.iconClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{n.title}</span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                        <ChannelIcon className="w-3 h-3" />{n.type ?? "InApp"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground/60">{formatDate(n.createdDate)}</span>
                      {n.actionUrl && (
                        <a href={n.actionUrl}
                          className="text-xs text-[#0052FC] hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />{t("common.view")}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    {!n.isRead && (
                      <>
                        <div className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
                        <button onClick={() => handleMarkRead(n)}
                          className="text-muted-foreground hover:text-foreground transition-colors" title={t("common.markAsRead")}>
                          <Eye className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button onClick={() => setDeleteTarget(n)}
                      className="text-muted-foreground hover:text-red-500 transition-colors" title={t("common.deleteItem")}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <DataPagination
            page={pg.page}
            totalPages={pg.totalPages}
            total={pg.total}
            from={pg.from}
            to={pg.to}
            pageSize={pg.pageSize}
            onPageChange={pg.goTo}
            onPageSizeChange={pg.changePageSize}
            className="rounded-xl border border-border mt-2"
          />
        </div>
      )}
    </div>
  );
}
