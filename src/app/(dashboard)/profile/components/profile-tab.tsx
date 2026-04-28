"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { User, Mail, Shield, Phone, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import { authApi } from "@/lib/api/auth";
import { ApiError, isApiConfigured } from "@/lib/api/client";
import { BusinessCard } from "./business-card";

export function ProfileTab() {
  const { user } = useAuth();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "";

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!firstName.trim()) {
      toast.error("الاسم الأول مطلوب.");
      return;
    }
    if (!isApiConfigured()) {
      toast.success("تم حفظ الملف الشخصي (وضع تجريبي).");
      return;
    }
    setSavingProfile(true);
    try {
      await authApi.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      toast.success("تم تحديث الملف الشخصي بنجاح.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "تعذر حفظ التغييرات.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("يرجى تعبئة جميع حقول كلمة المرور.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة وتأكيدها غير متطابقتين.");
      return;
    }
    if (!isApiConfigured()) {
      toast.success("تم تحديث كلمة المرور (وضع تجريبي).");
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success("تم تغيير كلمة المرور بنجاح.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "تعذر تغيير كلمة المرور. تحقق من كلمة المرور الحالية.");
    } finally {
      setSavingPassword(false);
    }
  };

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
                  <span className="text-muted-foreground">الدور</span>
                  <span className="font-semibold text-primary">
                    {user?.role ?? (user?.plan === "pro" ? "احترافية" : user?.plan === "trial" ? "تجريبية" : "مجانية")}
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
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">الاسم الأخير</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email ?? ""}
                    disabled
                    className="pr-10 text-left opacity-60 cursor-not-allowed"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      defaultValue={user?.phoneNumber ?? user?.phone ?? ""}
                      className="pr-10 text-left"
                      dir="ltr"
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">الدولة / المدينة</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input id="location" defaultValue={user?.location ?? ""} className="pr-10" disabled />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border pt-4">
              <Button className="font-bold h-10" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                حفظ التغييرات
              </Button>
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
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pr-10"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border pt-4">
              <Button
                className="font-bold h-10"
                variant="secondary"
                onClick={handleChangePassword}
                disabled={savingPassword}
              >
                {savingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                تحديث كلمة المرور
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Business information section */}
      <div>
        <h3 className="text-lg font-semibold tracking-tight mb-1">النشاط التجاري</h3>
        <p className="text-muted-foreground text-sm mb-4">المعلومات المرتبطة بنشاطك التجاري.</p>
        <BusinessCard />
      </div>
    </div>
  );
}
