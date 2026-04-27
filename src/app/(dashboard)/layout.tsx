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
  const { status, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
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

      <div className="flex flex-col">
        <TopBar onLogout={logout} />
        <main className="flex flex-1 flex-col gap-6 p-4 lg:p-8 pb-20 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
