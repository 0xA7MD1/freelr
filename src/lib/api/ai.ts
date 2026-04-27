import type { AIAnalysisPayload, AIAnalysisResponse } from "./types";

/**
 * Calls the local Next.js Route Handler that proxies to Gemini.
 * The API key never reaches the browser — the route reads `GEMINI_API_KEY`
 * from the server-side environment.
 *
 * NOTE: This must always target the same-origin `/api/ai/analyze` route, so it
 * deliberately bypasses `NEXT_PUBLIC_API_BASE_URL` and uses `fetch` directly.
 */
export const aiApi = {
  async analyze(payload: AIAnalysisPayload): Promise<AIAnalysisResponse> {
    // REVIEW: check if this matches the backend before connecting
    const res = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const body = isJson ? await res.json().catch(() => null) : null;
    if (!res.ok) {
      const message = body && typeof body === "object" && "message" in body && typeof body.message === "string"
        ? body.message
        : `Request failed with status ${res.status}`;
      throw new Error(message);
    }
    return body as AIAnalysisResponse;
  },
};



