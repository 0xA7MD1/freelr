import { Bot, CreditCard, LayoutDashboard, Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TabId =
  | "overview"
  | "invoice"
  | "expenses"
  | "ai"
  | "profile"
  | "notifications";

export interface NavItem {
  id: TabId;
  name: string;
  icon: LucideIcon;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "overview", name: "نظرة عامة", icon: LayoutDashboard, href: "/home" },
  { id: "invoice", name: "الفواتير", icon: Receipt, href: "/invoices" },
  { id: "expenses", name: "المصروفات", icon: CreditCard, href: "/expenses" },
  { id: "ai", name: "المساعد الذكي", icon: Bot, href: "/ai" },
];



