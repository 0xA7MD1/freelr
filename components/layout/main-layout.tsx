"use client";

import { useState } from "react";
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  Bot, 
  LogOut,
  Menu,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { InvoiceTab } from "@/components/invoice/invoice-tab";
import { ExpensesTab } from "@/components/expenses/expenses-tab";
import { AITab } from "@/components/ai/ai-tab";
import { Logo } from "@/components/ui/logo";

import { ProfileTab } from "@/components/profile/profile-tab";
import { NotificationsTab } from "@/components/notifications/notifications-tab";

interface MainLayoutProps {
  onLogout: () => void;
}

type TabType = "overview" | "invoice" | "expenses" | "ai" | "profile" | "notifications";

export function MainLayout({ onLogout }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const navigation = [
    { name: "نظرة عامة", id: "overview", icon: LayoutDashboard },
    { name: "الفواتير", id: "invoice", icon: Receipt },
    { name: "المصروفات", id: "expenses", icon: CreditCard },
    { name: "المساعد الذكي", id: "ai", icon: Bot },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab />;
      case "invoice": return <InvoiceTab />;
      case "expenses": return <ExpensesTab />;
      case "ai": return <AITab />;
      case "profile": return <ProfileTab />;
      case "notifications": return <NotificationsTab />;
      default: return <OverviewTab />;
    }
  };

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-20 items-center px-6 mb-2">
        <div className="flex items-center gap-3 font-semibold text-[#0052FC]">
          <Logo className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight font-[family-name:var(--font-inter)]">Freelr</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <nav className="grid items-start px-4 space-y-2 text-sm font-medium">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex items-center gap-3 rounded-[8px] px-4 py-3 transition-colors w-full text-right ${
                activeTab === item.id 
                  ? "bg-secondary text-secondary-foreground font-semibold" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" strokeWidth={activeTab === item.id ? 2.5 : 2} />
              {item.name}
            </button>
          ))}
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

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-l bg-card md:block">
        {renderSidebarContent()}
      </div>

      <div className="flex flex-col">
        {/* Desktop and Mobile Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-8 justify-between z-10 shrink-0">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="text-sm hidden md:block">الأربعاء، 24 مايو 2024</span>
            <div className="md:hidden flex items-center gap-2 font-semibold">
              <Logo className="w-6 h-6" />
              <span className="text-[#0052FC] text-lg font-bold font-[family-name:var(--font-inter)]">Freelr</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('profile')} 
              className="hidden md:flex items-center gap-3 mr-4 hover:bg-secondary/50 p-1.5 rounded-[12px] transition-colors cursor-pointer text-right border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-muted-foreground"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </div>
              <span className="text-sm font-medium">أحمد محمد</span>
            </button>

            <Button 
              variant="ghost" 
              size="icon" 
              className={`relative group text-muted-foreground hover:text-foreground ${activeTab === 'notifications' ? 'bg-secondary text-foreground' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-card"></span>
            </Button>
            
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
                {renderSidebarContent()}
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-6 p-4 lg:p-8 pb-20 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
