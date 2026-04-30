"use client";

import { ClientsTab } from "./components/clients-tab";
import { useT } from "@/lib/i18n";

export default function ClientsPage() {
  const t = useT();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-tight">{t("pages.clients.title")}</h1>
        <p className="text-muted-foreground text-[clamp(0.8125rem,2vw,0.875rem)] mt-1">
          {t("pages.clients.description")}
        </p>
      </div>
      <ClientsTab />
    </div>
  );
}
