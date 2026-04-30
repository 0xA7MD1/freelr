"use client";

import { Logo } from "@/components/shared/ui/logo";
import { NAV_ITEMS } from "./navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout: _ }: SidebarProps) {
  const pathname = usePathname();
  const t = useT();

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-20 items-center px-6 mb-2">
        <Link href="/home" className="flex items-center gap-3 font-semibold text-[#0052FC]">
          <Logo className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight font-sans">Freelr</span>
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
                {t(`nav.${item.id}`)}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
