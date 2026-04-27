"use client";

import { Card, CardContent } from "@/components/shared/ui/card";
import { Bell, CheckCircle2, AlertCircle, Info, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { toast } from "sonner";
import { useFetch } from "@/lib/hooks/use-fetch";
import { notificationsApi } from "@/lib/api/notifications";
import { ApiError, isApiConfigured } from "@/lib/api/client";
import { MOCK_NOTIFICATIONS } from "@/lib/api/mocks";
import type { NotificationItem } from "@/lib/api/types";

const ICON_MAP: Record<NotificationItem["type"], { Icon: typeof CheckCircle2; color: string; bgColor: string }> = {
  success: { Icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  warning: { Icon: AlertCircle, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  renewal: { Icon: RefreshCcw, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  info: { Icon: Info, color: "text-[#0052FC]", bgColor: "bg-[#0052FC]/10" },
};

export function NotificationsTab() {
  const apiOn = isApiConfigured();
  const { data, setData, isLoading } = useFetch<NotificationItem[]>(
    () => notificationsApi.list(),
    { fallback: MOCK_NOTIFICATIONS, enabled: apiOn },
  );
  const notifications = data ?? MOCK_NOTIFICATIONS;

  const handleMarkAll = async () => {
    if (apiOn) {
      try {
        await notificationsApi.markAllRead();
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "تعذّر تحديث الحالة.");
        return;
      }
    }
    setData((prev) => (prev ?? notifications).map((n) => ({ ...n, read: true })));
    toast.success("تم تحديث الإشعارات.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">الإشعارات</h2>
          <p className="text-muted-foreground text-sm">آخر التحديثات والتنبيهات الخاصة بحسابك.</p>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto font-medium" onClick={handleMarkAll}>
          تحديد الكل كمقروء
        </Button>
      </div>

      {isLoading && notifications.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const meta = ICON_MAP[notification.type];
            const Icon = meta.Icon;
            return (
              <Card key={notification.id} className={`shadow-sm border-border ${notification.read ? "opacity-70" : ""}`}>
                <CardContent className="p-4 flex gap-4">
                  <div className={`p-2 rounded-full h-min shrink-0 ${meta.bgColor} ${meta.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className={`font-semibold ${notification.read ? "text-muted-foreground" : "text-foreground"}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{notification.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  </div>
                  {!notification.read && (
                    <div className="shrink-0 flex items-center justify-center pl-2">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {notifications.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <div className="p-4 bg-secondary rounded-full mb-4">
            <Bell size={32} />
          </div>
          <h3 className="text-lg font-bold">لا توجد إشعارات</h3>
          <p className="text-sm text-muted-foreground max-w-[250px]">
            أنت على اطلاع بكل شيء! سنقوم بإرسال إشعارات هنا عندما يكون هناك تحديث.
          </p>
        </div>
      )}
    </div>
  );
}



