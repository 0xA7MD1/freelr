"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { Sidebar } from "@/app/components/sidebar";
import { TopBar } from "@/app/components/topbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, logout, businessId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && businessId === null) {
      router.push("/onboarding");
    }
  }, [status, businessId, router]);

  if (status === "loading" || status === "unauthenticated" || businessId === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-l bg-card md:block">
        <Sidebar onLogout={logout} />
      </aside>

      <div className="flex flex-col h-screen">
        <TopBar onLogout={logout} />
        <main className="flex flex-1 flex-col gap-6 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
        <footer className="shrink-0 border-t bg-card px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Freelr. جميع الحقوق محفوظة.</span>
          <span className="hidden sm:block">صُنع بحب للمستقلين العرب</span>
        </footer>
      </div>
    </div>
  );
}
