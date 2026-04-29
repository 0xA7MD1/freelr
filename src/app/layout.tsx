import type { Metadata } from "next";
import "./globals.css";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/shared/ui/sonner";
import { AuthProvider } from "@/lib/auth/auth-context";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Freelr",
  description: "أدوات المال للمستقل وصاحب المشروع الصغير",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cn("font-sans", ibmPlexSansArabic.variable)}>
      <body suppressHydrationWarning className="bg-muted/30">
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-center" dir="rtl" />
      </body>
    </html>
  );
}



