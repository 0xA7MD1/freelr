// ─── Enums ───────────────────────────────────────────────────────────────────

export enum InvoiceStatus {
  Draft = 0,
  Sent = 1,
  Paid = 2,
  PartiallyPaid = 3,
  Overdue = 4,
  Cancelled = 5,
}

export enum PaymentMethod {
  Cash = 0,
  BankTransfer = 1,
  CreditCard = 2,
  DebitCard = 3,
  PayPal = 4,
  Stripe = 5,
  Crypto = 6,
  Cheque = 7,
  Other = 8,
}

export enum RiskLevel {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  permissions: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
}

// ─── User / Profile ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // API field
  phoneNumber?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  role?: string;
  createdDate?: string;
  // UI-only compat fields
  phone?: string;
  location?: string;
  avatarUrl?: string;
  plan?: "free" | "pro" | "trial";
}

// ─── Business ─────────────────────────────────────────────────────────────────

export interface Business {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  currency: string;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
}

export interface CreateBusinessPayload {
  name: string;
  description?: string;
  industry?: string;
  currency: string;
  ownerId: string;
}

export interface UpdateBusinessPayload {
  ownerId: string;
  name: string;
  description?: string;
  industry?: string;
  currency: string;
  address?: string;
  phone?: string;
  website?: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string | null;
  createdDate?: string;
}

export interface CreateClientPayload {
  businessId: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
}

export interface UpdateClientPayload extends CreateClientPayload {
  notes?: string;
  updatedBy?: string;
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoicePayment {
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  status: InvoiceStatus | string;
  issueDate: string;
  dueDate: string;
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  notes?: string;
  items: InvoiceItem[];
  payments?: InvoicePayment[];
}

export interface CreateInvoicePayload {
  businessId: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  taxRate?: number;
  notes?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface RecordPaymentPayload {
  invoiceId: string;
  businessId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
  updatedBy?: string;
}

// ─── Expense ──────────────────────────────────────────────────────────────────

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  /** ISO date string — primary field from API */
  expenseDate: string;
  /** Display name — populated from categoryName on API responses, or raw text in mock */
  category: string;
  /** Real category ID returned by the API */
  categoryId?: string;
  /** Raw category name as returned by the API */
  categoryName?: string;
  vendor?: string;
  isRecurring?: boolean;
  receiptUrl?: string | null;
  notes?: string | null;
  createdDate?: string;
  /** UI alias kept for backward compat */
  date?: string;
}

export interface CreateExpensePayload {
  businessId: string;
  amount: number;
  description: string;
  expenseDate?: string;
  /** Required by backend — must be a valid category Guid */
  categoryId: string;
  vendor?: string;
  isRecurring?: boolean;
  notes?: string;
}

export interface UploadReceiptResponse {
  receiptUrl: string;
}

// ─── Income ───────────────────────────────────────────────────────────────────

export interface IncomeEntry {
  id: string;
  amount: number;
  description: string;
  transactionDate: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  clientId?: string;
  clientName?: string;
  receiptUrl?: string | null;
  notes?: string | null;
  createdDate?: string;
  /** UI alias */
  source?: string;
  /** UI alias */
  incomeDate?: string;
}

export interface CreateIncomePayload {
  businessId: string;
  amount: number;
  description: string;
  transactionDate: string;
  categoryId: string;
  clientId?: string;
  notes?: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
  description?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardOverview {
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
  unpaidInvoicesTotal: number;
  overdueInvoicesCount?: number;
  totalClients?: number;
  pendingInvoices?: number;
  incomeChangePercent?: number;
  expenseChangePercent?: number;
  unreadAlertsCount: number;
}

export interface DashboardChartPoint {
  month: string;
  amount: number;
}

export interface DashboardCategoryPoint {
  category: string;
  amount: number;
  percentage?: number;
}

export interface DashboardChartsData {
  incomeByMonth: DashboardChartPoint[];
  expensesByMonth: DashboardChartPoint[];
  incomeByCategory: DashboardCategoryPoint[];
  expensesByCategory: DashboardCategoryPoint[];
}

// ─── Forecast ─────────────────────────────────────────────────────────────────

export interface ForecastResponse {
  forecastId: string;
  expectedIncome: number;
  expectedExpenses?: number;
  netCashflow?: number;
  riskLevel: RiskLevel | string;
  expectedShortage?: number;
  recommendations: string[];
  periodStart?: string;
  periodEnd?: string;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  alertType: string;
  severity: string;
  message: string;
  isRead: boolean;
  readAt?: string | null;
  relatedEntityId?: string | null;
  createdDate: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

/**
 * Raw shape returned by the API.
 */
export interface NotificationApi {
  id: string;
  title: string;
  message: string;
  type: string;
  priority?: string;
  channel?: string;
  isRead: boolean;
  readAt?: string | null;
  actionUrl?: string;
  icon?: string;
  createdDate?: string;
}

/**
 * Normalised shape used by UI components.
 */
export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "success" | "warning" | "info" | "renewal";
  read: boolean;
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface AIAnalysisPayload {
  businessId: string;
  additionalContext?: string;
}

export interface AIAnalysisResponse {
  riskAnalysis: string;
  recommendations: string[];
  optimizationOpportunities: string[];
  riskLevel: string;
  projectedCashflow: number;
}

// ─── Chart / Insight helpers (UI-only) ───────────────────────────────────────

export interface ChartPoint {
  name: string;
  income: number;
  expenses: number;
}

export interface AIInsight {
  id: string;
  kind: "saving" | "collection" | "info";
  title: string;
  body: string;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  client: string;
  date: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
}

export interface LiquidityAlert {
  severity: "info" | "warning" | "danger";
  expectedShortfall: number;
  currency: string;
  message: string;
}

// ─── Problem Details ──────────────────────────────────────────────────────────

export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
