"use client";

import { Bell, Menu } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/shared/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/shared/ui/sheet";
import { Logo } from "@/components/shared/ui/logo";
import { useAuth } from "@/lib/auth/auth-context";
import { Sidebar } from "./sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopBarProps {
  onLogout: () => void;
}

export function TopBar({ onLogout }: TopBarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const today = useMemo(
    () =>
      new Date().toLocaleDateString("ar-AE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "حسابي";

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-8 justify-between z-10 shrink-0">
      <div className="flex items-center gap-4 text-muted-foreground">
        <span className="text-sm hidden md:block">{today}</span>
        <div className="md:hidden flex items-center gap-2 font-semibold">
          <Logo className="w-6 h-6" />
          <span className="text-[#0052FC] text-lg font-bold font-[family-name:var(--font-inter)]">Freelr</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="hidden md:flex items-center gap-3 mr-4 hover:bg-secondary/50 p-1.5 rounded-[12px] transition-colors cursor-pointer text-right border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="الملف الشخصي"
        >
          <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <span className="text-sm font-medium">{fullName}</span>
        </Link>

        <Link href="/alerts">
          <Button
            variant="ghost"
            size="icon"
            className={`relative group text-muted-foreground hover:text-foreground ${pathname === "/alerts" ? "bg-secondary text-foreground" : ""}`}
            aria-label="التنبيهات"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-card" />
          </Button>
        </Link>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="shrink-0 md:hidden text-muted-foreground hover:text-foreground">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            }
          />
          <SheetContent side="right" className="flex flex-col p-0 w-64 border-none">
            <Sidebar onLogout={onLogout} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}



