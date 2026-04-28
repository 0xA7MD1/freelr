import { api } from "./client";
import type { AIAnalysisPayload, AIAnalysisResponse } from "./types";

export const aiApi = {
  analyze(payload: AIAnalysisPayload): Promise<AIAnalysisResponse> {
    return api.post<AIAnalysisResponse>("/api/v1/ai/analyze", payload);
  },
};
