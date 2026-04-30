"use client";

import { InvoiceTab } from "./components/invoice-tab";
import { useT } from "@/lib/i18n";

export default function InvoicesPage() {
  const t = useT();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-tight">{t("pages.invoices.title")}</h1>
        <p className="text-muted-foreground text-[clamp(0.8125rem,2vw,0.875rem)] mt-1">
          {t("pages.invoices.description")}
        </p>
      </div>
      <InvoiceTab />
    </div>
  );
}
