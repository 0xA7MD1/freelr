import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle2, AlertCircle, Info, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const notifications = [
  {
    id: 1,
    title: "تم دفع الفاتورة #1204",
    description: "قام العميل محمد عبدالرحمن بدفع الفاتورة المستحقة.",
    time: "منذ ساعتين",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    isRead: false,
  },
  {
    id: 2,
    title: "تنبيه: انخفاض السيولة",
    description: "توقعات السيولة تشير إلى انخفاض محتمل نهاية الشهر الحالي بناءً على التزاماتك.",
    time: "أمس، 02:30 م",
    icon: AlertCircle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    isRead: false,
  },
  {
    id: 3,
    title: "تم تحديث اشتراكك",
    description: "تم تجديد اشتراك باقة الاحترافية بنجاح لمدة شهر إضافي.",
    time: "أمس، 10:00 ص",
    icon: RefreshCcw,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    isRead: true,
  },
  {
    id: 4,
    title: "ميزة جديدة متوفرة",
    description: "الآن يمكنك ربط حسابك البنكي مباشرة لاستيراد المعاملات آلياً.",
    time: "22 مايو 2024",
    icon: Info,
    color: "text-[#0052FC]",
    bgColor: "bg-[#0052FC]/10",
    isRead: true,
  }
];

export function NotificationsTab() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">الإشعارات</h2>
          <p className="text-muted-foreground text-sm">
            آخر التحديثات والتنبيهات الخاصة بحسابك.
          </p>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto font-medium">
          تحديد الكل كمقروء
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`shadow-sm border-border ${notification.isRead ? 'opacity-70' : ''}`}>
            <CardContent className="p-4 flex gap-4">
              <div className={`p-2 rounded-full h-min shrink-0 ${notification.bgColor} ${notification.color}`}>
                <notification.icon size={20} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className={`font-semibold ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {notification.time}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.description}
                </p>
              </div>
              {!notification.isRead && (
                <div className="shrink-0 flex items-center justify-center pl-2">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {notifications.length === 0 && (
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
