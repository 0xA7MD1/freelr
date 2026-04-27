"use client";

import { useRouter } from "next/navigation";
import { LoginScreen } from "@/components/shared/auth/login-screen";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  return <LoginScreen onLogin={() => router.push("/home")} initialMode="forgot-password" />;
}



