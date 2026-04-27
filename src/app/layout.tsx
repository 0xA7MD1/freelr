import type { Metadata } from "next";
import "./globals.css";
import { Cairo, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/shared/ui/sonner";
import { AuthProvider } from "@/lib/auth/auth-context";

const cairo = Cairo({ subsets: ["arabic"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Freelr",
  description: "أدوات المال للمستقل وصاحب المشروع الصغير",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cn("font-sans", cairo.variable, inter.variable)}>
      <body suppressHydrationWarning className="bg-muted/30">
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-center" dir="rtl" />
      </body>
    </html>
  );
}



