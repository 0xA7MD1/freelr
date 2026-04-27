"use client";

import { useRouter } from "next/navigation";
import { LoginScreen } from "@/components/auth/login-screen";

export default function RegisterPage() {
  const router = useRouter();
  
  return <LoginScreen onLogin={() => router.push("/")} initialMode="register" />;
}
