"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { User, Mail, Shield, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export function ProfileTab() {
  const { user } = useAuth();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">الملف الشخصي</h2>
        <p className="text-muted-foreground text-sm">إدارة إعدادات حسابك وتفضيلاتك الشخصية.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-primary border-4 border-background shadow-sm">
                  <User size={40} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">{fullName || "—"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
                </div>
                <div className="w-full pt-4 border-t border-border flex justify-between text-sm">
                  <span className="text-muted-foreground">الباقة الحالية</span>
                  <span className="font-semibold text-primary">
                    {user?.plan === "pro" ? "احترافية" : user?.plan === "trial" ? "تجريبية" : "مجانية"}
                  </span>
                </div>
                <Button className="w-full font-bold h-10 mt-2" variant="outline">
                  تغيير الصورة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
              <CardDescription>قم بتحديث بياناتك الشخصية الأساسية ومعلومات الاتصال.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input id="firstName" defaultValue={user?.firstName ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">الاسم الأخير</Label>
                  <Input id="lastName" defaultValue={user?.lastName ?? ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input id="email" type="email" defaultValue={user?.email ?? ""} className="pr-10 text-left" dir="ltr" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input id="phone" type="tel" defaultValue={user?.phone ?? ""} className="pr-10 text-left" dir="ltr" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">الدولة / المدينة</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input id="location" defaultValue={user?.location ?? ""} className="pr-10" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border pt-4">
              <Button className="font-bold h-10">حفظ التغييرات</Button>
            </CardFooter>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle>تغيير كلمة المرور</CardTitle>
              <CardDescription>تأكد من اختيار كلمة مرور قوية للحفاظ على أمان حسابك.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <div className="relative">
                  <Shield className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input id="currentPassword" type="password" placeholder="••••••••" className="pr-10" autoComplete="current-password" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                  <Input id="newPassword" type="password" placeholder="••••••••" autoComplete="new-password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border pt-4">
              <Button className="font-bold h-10" variant="secondary">
                تحديث كلمة المرور
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}



