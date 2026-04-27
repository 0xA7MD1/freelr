"use client";

import { LogOut } from "lucide-react";
import { Logo } from "@/components/shared/ui/logo";
import { NAV_ITEMS } from "./navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-20 items-center px-6 mb-2">
        <Link href="/home" className="flex items-center gap-3 font-semibold text-[#0052FC]">
          <Logo className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight font-[family-name:var(--font-inter)]">Freelr</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto">
        <nav className="grid items-start px-4 space-y-2 text-sm font-medium">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 rounded-[8px] px-4 py-3 transition-colors w-full text-right ${
                  isActive ? "bg-secondary text-secondary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-6">
        <div className="bg-primary text-primary-foreground p-4 rounded-[12px]">
          <p className="text-xs text-primary-foreground/70 mb-1">النسخة الاحترافية</p>
          <p className="text-sm font-medium">باقي 12 يوم على التجربة</p>
          <button className="mt-3 w-full bg-background text-foreground text-xs font-bold py-2 rounded-[10px] hover:bg-background/90 transition-colors">
            ترقية الآن
          </button>
        </div>
        <button
          onClick={onLogout}
          className="mt-4 flex w-full items-center gap-3 rounded-[8px] px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}



