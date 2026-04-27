import {
  InvoiceStatus,
  type AIInsight,
  type ChartPoint,
  type DashboardOverview,
  type Expense,
  type LiquidityAlert,
  type NotificationItem,
  type RecentInvoice,
} from "./types";

export const MOCK_DASHBOARD: DashboardOverview = {
  totalIncome: 18000,
  totalExpenses: 14000,
  netCashflow: 4000,
  unpaidInvoicesTotal: 6500,
  unreadAlertsCount: 2,
};

export const MOCK_CURRENCY = "AED";

export const MOCK_INCOME_CHANGE_PCT = 12;
export const MOCK_EXPENSES_CHANGE_PCT = 5;
export const MOCK_PROFIT_MARGIN_PCT = 22;

export const MOCK_CHART: ChartPoint[] = [
  { name: "يناير", income: 12000, expenses: 8000 },
  { name: "فبراير", income: 14000, expenses: 9000 },
  { name: "مارس", income: 11000, expenses: 10000 },
  { name: "أبريل", income: 18000, expenses: 14000 },
  { name: "مايو", income: 10000, expenses: 14000 },
];

export const MOCK_INSIGHTS: AIInsight[] = [
  {
    id: "i1",
    kind: "saving",
    title: "تخفيض التكاليف",
    body: "قلل الإنفاق التسويقي بنسبة 15% لهذا الشهر لتحقيق الهدف المستهدف.",
  },
  {
    id: "i2",
    kind: "collection",
    title: "تحصيل الأموال",
    body: "أرسل تذكير للعملاء المتأخرين (3 فواتير بقيمة 6,500 AED).",
  },
];

export const MOCK_RECENT_INVOICES: RecentInvoice[] = [
  {
    id: "INV-001",
    invoiceNumber: "INV-2026-001",
    client: "شركة الأمل للتجارة",
    date: "22 مايو",
    amount: 4500,
    currency: "AED",
    status: InvoiceStatus.Paid,
  },
  {
    id: "INV-002",
    invoiceNumber: "INV-2026-002",
    client: "مؤسسة رؤية المستقبل",
    date: "18 مايو",
    amount: 2200,
    currency: "AED",
    status: InvoiceStatus.Overdue,
  },
];

export const MOCK_LIQUIDITY_ALERT: LiquidityAlert = {
  severity: "warning",
  expectedShortfall: 4000,
  currency: "AED",
  message: "توقعات الذكاء الاصطناعي تشير إلى احتمال وجود عجز الشهر القادم بسبب الالتزامات الثابتة.",
};

export const MOCK_EXPENSES: Expense[] = [
  { id: "1", amount: 1500, category: "تسويق", description: "إعلانات جوجل", date: new Date(2026, 3, 20).toISOString() },
  { id: "2", amount: 450, category: "برمجيات", description: "اشتراك Github & Vercel", date: new Date(2026, 3, 18).toISOString() },
  { id: "3", amount: 120, category: "ضيافة", description: "قهوة اجتماع عميل", date: new Date(2026, 3, 15).toISOString() },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "تم دفع الفاتورة #1204",
    description: "قام العميل محمد عبدالرحمن بدفع الفاتورة المستحقة.",
    time: "منذ ساعتين",
    type: "success",
    read: false,
  },
  {
    id: "n2",
    title: "تنبيه: انخفاض السيولة",
    description: "توقعات السيولة تشير إلى انخفاض محتمل نهاية الشهر الحالي بناءً على التزاماتك.",
    time: "أمس، 02:30 م",
    type: "warning",
    read: false,
  },
  {
    id: "n3",
    title: "تم تحديث اشتراكك",
    description: "تم تجديد اشتراك باقة الاحترافية بنجاح لمدة شهر إضافي.",
    time: "أمس، 10:00 ص",
    type: "renewal",
    read: true,
  },
  {
    id: "n4",
    title: "ميزة جديدة متوفرة",
    description: "الآن يمكنك ربط حسابك البنكي مباشرة لاستيراد المعاملات آلياً.",
    time: "22 مايو 2026",
    type: "info",
    read: true,
  },
];
