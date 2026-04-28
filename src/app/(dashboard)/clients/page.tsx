import { ClientsTab } from "./components/clients-tab";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-tight">العملاء</h1>
        <p className="text-muted-foreground text-[clamp(0.8125rem,2vw,0.875rem)] mt-1">
          إدارة قائمة عملائك وبياناتهم التواصلية.
        </p>
      </div>
      <ClientsTab />
    </div>
  );
}
