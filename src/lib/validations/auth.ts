import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  remember: z.boolean().optional(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب"),
  lastName: z.string().min(1, "اسم العائلة مطلوب"),
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("صيغة البريد غير صحيحة"),
  phoneNumber: z
    .string()
    .min(7, "رقم الهاتف غير صالح")
    .regex(/^[+0-9\s-]+$/u, "رقم الهاتف يحتوي على أحرف غير مسموح بها"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("صيغة البريد غير صحيحة"),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;



