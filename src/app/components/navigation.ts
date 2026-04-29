import { Bot, CreditCard, DollarSign, LayoutDashboard, Receipt, Users, Bell, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TabId =
  | "overview"
  | "invoice"
  | "income"
  | "expenses"
  | "clients"
  | "ai"
  | "forecasts"
  | "alerts"
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
  { id: "income", name: "الدخل", icon: DollarSign, href: "/income" },
  { id: "expenses", name: "المصروفات", icon: CreditCard, href: "/expenses" },
  { id: "clients", name: "العملاء", icon: Users, href: "/clients" },
  { id: "forecasts", name: "التوقعات", icon: TrendingUp, href: "/forecasts" },
  { id: "ai", name: "المساعد الذكي", icon: Bot, href: "/ai" },
  { id: "alerts", name: "التنبيهات", icon: Bell, href: "/alerts" },
];
