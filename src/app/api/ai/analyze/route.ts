import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  income: z.number().nonnegative(),
  expenses: z.number().nonnegative(),
  industry: z.string().max(120).optional(),
});

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

function buildPrompt({
  income,
  expenses,
  industry,
}: z.infer<typeof payloadSchema>) {
  return `أنا مستقل/فريلانسر أعمل في مجال ${industry?.trim() || "غير محدد"}.
متوسط دخلي الشهري هو ${income} درهم.
ومتوسط مصروفاتي الشهرية هي ${expenses} درهم.

كخبير مالي، قدم لي:
1. تحليل سريع لوضعي المالي.
2. نسبة الربح الحالية وهل هي جيدة؟
3. توقع للسيولة (Cashflow) خلال الأشهر القادمة إذا استمر الوضع هكذا.
4. ثلاث نصائح عملية لتقليل المصروفات أو زيادة الدخل.

الرجاء تقديم إجابة مختصرة، احترافية ومباشرة وبتنسيق Markdown.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "الخادم لم يتم إعداده لتحليل البيانات. يرجى التواصل مع الدعم." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON غير صالح" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "البيانات المرسلة غير مكتملة", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt(parsed.data),
    });
    const analysis =
      response.text ??
      "لم أتمكن من إيجاد تحليل، يرجى المحاولة مرة أخرى.";
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("[ai/analyze] generateContent failed", err);
    return NextResponse.json(
      { message: "تعذّر التحليل في الوقت الحالي. حاول لاحقاً." },
      { status: 502 },
    );
  }
}



