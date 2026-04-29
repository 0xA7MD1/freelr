import { InvoiceTab } from "./components/invoice-tab";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-tight">الفواتير</h1>
        <p className="text-muted-foreground text-[clamp(0.8125rem,2vw,0.875rem)] mt-1">
          إدارة فواتيرك ومتابعة المدفوعات بكفاءة.
        </p>
      </div>
      <InvoiceTab />
    </div>
  );
}
