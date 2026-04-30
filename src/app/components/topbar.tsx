"use client";

import { Bell, Menu, User, LogOut, Building2, ChevronDown } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/shared/ui/sheet";
import { Logo } from "@/components/shared/ui/logo";
import { useAuth } from "@/lib/auth/auth-context";
import { Sidebar } from "./sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/shared/ui/language-switcher";
import { useT, useLanguage } from "@/lib/i18n";

interface TopBarProps {
  onLogout: () => void;
}

export function TopBar({ onLogout }: TopBarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const t = useT();
  const { locale } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(locale === "ar" ? "ar-AE" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [locale],
  );
  const router = useRouter();
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    t("topbar.myAccount");

  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, left: rect.left });
    }
    setDropdownOpen(true);
  };

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-8 justify-between shrink-0 relative z-40">
      <div className="flex items-center gap-4 text-muted-foreground">
        <span className="text-sm hidden md:block">{today}</span>
        <div className="md:hidden flex items-center gap-2 font-semibold">
          <Logo className="w-6 h-6" />
          <span className="text-[#0052FC] text-lg font-bold font-sans">Freelr</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher className="hidden md:flex" />

        {/* Notification bell → /notifications */}
        <button
          onClick={() => router.push("/notifications")}
          className={`relative size-8 flex items-center justify-center rounded-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${pathname === "/notifications" ? "bg-secondary text-foreground" : ""}`}
          aria-label={t("topbar.notifications")}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-card" />
        </button>

        {/* User dropdown trigger */}
        <button
          ref={buttonRef}
          onClick={() => (dropdownOpen ? setDropdownOpen(false) : openDropdown())}
          className="hidden md:flex items-center gap-2 hover:bg-secondary/50 px-2.5 py-1.5 rounded-[12px] transition-colors cursor-pointer border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4 text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <span className="text-sm font-medium">{fullName}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden text-muted-foreground hover:text-foreground"
              >
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

      {/* Dropdown — fixed to escape any stacking context */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
          className="fixed w-52 rounded-xl border border-border bg-card shadow-xl py-1 z-[9999]"
        >
          {/* User info header */}
          <div className="px-3 py-2.5 border-b border-border mb-1">
            <p className="text-xs font-semibold truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
          </div>

          <Link
            href="/profile"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors rounded-lg mx-1"
          >
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            {t("topbar.profile")}
          </Link>

          <Link
            href="/business"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors rounded-lg mx-1"
          >
            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
            {t("topbar.business")}
          </Link>

          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={() => {
                setDropdownOpen(false);
                onLogout();
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-lg mx-1 w-full text-right"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {t("sidebar.logout")}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
