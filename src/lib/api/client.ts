import { authStorage } from "@/lib/auth/storage";
import type { ProblemDetails } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

export class ApiError extends Error {
  status: number;
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
  data?: unknown;

  constructor(init: {
    message: string;
    status: number;
    title?: string;
    detail?: string;
    errors?: Record<string, string[]>;
    data?: unknown;
  }) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status;
    this.title = init.title;
    this.detail = init.detail;
    this.errors = init.errors;
    this.data = init.data;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const isAbsolute = /^https?:\/\//i.test(path);
  const base = isAbsolute ? path : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    params.append(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${base}${base.includes("?") ? "&" : "?"}${qs}` : base;
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === "string" ||
    typeof v.detail === "string" ||
    typeof v.errors === "object"
  );
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, auth = true, query, headers, ...rest } = opts;

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !finalHeaders.has("Content-Type") && !(body instanceof FormData)) {
    finalHeaders.set("Content-Type", "application/json");
  }
  finalHeaders.set("Accept", "application/json");

  if (auth) {
    const token = authStorage.getToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    // REVIEW: check if this matches the backend before connecting
    response = await fetch(buildUrl(path, query), {
      ...rest,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      credentials: "include",
    });
  } catch (err) {
    throw new ApiError({
      message: err instanceof Error ? err.message : "Network error",
      status: 0,
    });
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json") || contentType.includes("application/problem+json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) authStorage.clear();
    if (isProblemDetails(payload)) {
      const problem = payload as ProblemDetails;
      throw new ApiError({
        message: problem.detail ?? problem.title ?? `Request failed with status ${response.status}`,
        status: response.status,
        title: problem.title,
        detail: problem.detail,
        errors: problem.errors,
        data: payload,
      });
    }
    throw new ApiError({
      message: `Request failed with status ${response.status}`,
      status: response.status,
      data: payload,
    });
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...opts, method: "POST", body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...opts, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, "body" | "method">) =>
    apiRequest<T>(path, { ...opts, method: "DELETE" }),
};

export const isApiConfigured = () => API_BASE_URL.length > 0;

export function flattenProblemErrors(err: unknown): string[] {
  if (!(err instanceof ApiError)) return [];
  const out: string[] = [];
  if (err.errors) {
    for (const list of Object.values(err.errors)) for (const m of list) out.push(m);
  }
  return out;
}

const ARABIC_RANGE = /[؀-ۿ]/;

/** Translate any thrown error to a user-facing Arabic message. */
export function apiErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return err instanceof Error && err.message
      ? err.message
      : "حدث خطأ غير متوقع.";
  }

  if (err.detail && ARABIC_RANGE.test(err.detail)) return err.detail;
  if (err.title && ARABIC_RANGE.test(err.title)) return err.title;

  const validationMessages = flattenProblemErrors(err).filter((m) =>
    ARABIC_RANGE.test(m),
  );
  if (validationMessages.length) return validationMessages.join("، ");

  switch (err.status) {
    case 0:
      return "تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت.";
    case 400:
      return "البيانات المرسلة غير صحيحة.";
    case 401:
      return "انتهت جلستك. يرجى تسجيل الدخول مجدداً.";
    case 403:
      return "ليس لديك صلاحية للوصول إلى هذا المورد.";
    case 404:
      return "لم يتم العثور على البيانات المطلوبة.";
    case 405:
      return "العملية غير مدعومة من الخادم.";
    case 408:
      return "انتهت مهلة الطلب. حاول مرة أخرى.";
    case 409:
      return "البيانات تتعارض مع ما هو موجود مسبقاً.";
    case 422:
      return "تعذر معالجة البيانات المرسلة.";
    case 429:
      return "عدد كبير من الطلبات. الرجاء المحاولة لاحقاً.";
    case 500:
      return "حدث خطأ في الخادم. حاول مرة أخرى لاحقاً.";
    case 502:
    case 503:
    case 504:
      return "الخادم غير متاح حالياً. حاول لاحقاً.";
    default:
      return "حدث خطأ غير متوقع.";
  }
}
