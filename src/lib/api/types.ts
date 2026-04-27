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
  OnlinePayment = 5,
  Crypto = 6,
}

export enum RiskLevel {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

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

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  plan?: "free" | "pro" | "trial";
}

export interface Business {
  id: string;
  name: string;
  industry: string;
  currency: string;
  logoUrl: string | null;
  address: string;
  phone: string;
}

export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
}

export interface CreateClientPayload {
  businessId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  total: number;
  balanceDue: number;
  dueDate: string;
}

export interface RecordPaymentPayload {
  businessId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  notes: string;
}

export interface IncomeEntry {
  id: string;
  amount: number;
  source: string;
  incomeDate: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface CreateExpensePayload {
  amount: number;
  category: string;
  description: string;
  date?: string;
}

export interface UploadReceiptResponse {
  receiptUrl: string;
}

export interface DashboardOverview {
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
  unpaidInvoicesTotal: number;
  unreadAlertsCount: number;
}

export interface ForecastResponse {
  forecastId: string;
  expectedIncome: number;
  riskLevel: RiskLevel;
  recommendations: string[];
}

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

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "success" | "warning" | "info" | "renewal";
  read: boolean;
}

export interface AIAnalysisPayload {
  income: number;
  expenses: number;
  industry?: string;
}

export interface AIAnalysisResponse {
  analysis: string;
}

export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
