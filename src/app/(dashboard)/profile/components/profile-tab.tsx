"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { User, Mail, Shield, Phone, MapPin, Loader2, Building2, ChevronLeft, Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import { authApi } from "@/lib/api/auth";
import { ApiError, isApiConfigured } from "@/lib/api/client";
import Link from "next/link";

export function ProfileTab() {
  const { user } = useAuth();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "";
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";

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

  const planLabel =
    user?.plan === "pro" ? "احترافية" : user?.plan === "trial" ? "تجريبية" : "مجانية";
  const planColor =
    user?.plan === "pro"
      ? "bg-primary/10 text-primary"
      : user?.plan === "trial"
        ? "bg-amber-500/10 text-amber-600"
        : "bg-secondary text-muted-foreground";

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">الملف الشخصي</h2>
        <p className="text-muted-foreground text-sm">إدارة معلوماتك الشخصية وإعدادات الحساب.</p>
      </div>

      {/* Hero banner */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-l from-primary/20 via-primary/10 to-transparent" />
        <CardContent className="relative pb-6 pt-0 px-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="relative w-20 h-20 shrink-0">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold border-4 border-card shadow-md select-none">
                {initials}
              </div>
              <button
                className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-secondary border-2 border-card flex items-center justify-center hover:bg-muted transition-colors"
                title="تغيير الصورة"
              >
                <Camera className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold truncate">{fullName || "—"}</h3>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${planColor}`}>
                  {planLabel}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{user?.email ?? "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-column form area */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal info */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">المعلومات الشخصية</CardTitle>
                <CardDescription className="text-xs mt-0.5">البيانات الأساسية لحسابك.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-medium">الاسم الأول</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-medium">الاسم الأخير</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email ?? ""}
                  disabled
                  className="pr-9 h-9 text-sm text-left opacity-60 cursor-not-allowed"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={user?.phoneNumber ?? user?.phone ?? ""}
                    className="pr-9 h-9 text-sm text-left"
                    dir="ltr"
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-medium">الدولة / المدينة</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    defaultValue={user?.location ?? ""}
                    className="pr-9 h-9 text-sm"
                    disabled
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button className="h-9 text-sm font-semibold" onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin ml-2" />}
              حفظ التغييرات
            </Button>
          </CardFooter>
        </Card>

        {/* Password */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">كلمة المرور</CardTitle>
                <CardDescription className="text-xs mt-0.5">حافظ على أمان حسابك بكلمة مرور قوية.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-xs font-medium">كلمة المرور الحالية</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                className="h-9 text-sm"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-medium">كلمة المرور الجديدة</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                className="h-9 text-sm"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-medium">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="h-9 text-sm"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button
              className="h-9 text-sm font-semibold"
              variant="secondary"
              onClick={handleChangePassword}
              disabled={savingPassword}
            >
              {savingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin ml-2" />}
              تحديث كلمة المرور
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Business link card */}
      <Link href="/business" className="block group">
        <Card className="shadow-sm border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardContent className="flex items-center gap-4 py-5 px-6">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">إعدادات النشاط التجاري</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                اسم النشاط، المجال، العملة، معلومات الاتصال، وبيانات الفواتير.
              </p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
