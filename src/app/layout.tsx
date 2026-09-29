import type { Metadata } from "next";
import React, { Suspense } from "react";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { LoadingProvider } from "@/context/LoadingContext";
import FloatingSupportWidget from "@/components/FloatingSupportWidget";
import ReferralTracker from "@/components/ReferralTracker";
import MobileBottomNav from "@/components/MobileBottomNav";
import FloatingMascots from "@/components/FloatingMascots";

export const metadata: Metadata = {
  title: "RoleaTopup | Khmer Game Top-Up Platform",
  description: "RoleaTopup - Premier Khmer Game Top-Up Platform for Mobile Legends, PUBG Mobile, Free Fire, HoK, Valorant with Bakong KHQR, ABA, and Wing.",
  icons: {
    icon: "/images/rolea-logo.png",
    shortcut: "/images/rolea-logo.png",
    apple: "/images/rolea-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km">
      <head>
        <link rel="icon" href="/images/rolea-logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/images/rolea-logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Kantumruy+Pro:ital,wght@0,300..700;1,300..700&family=Noto+Sans+Khmer:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <LanguageProvider>
          <Suspense fallback={null}>
            <LoadingProvider>
              <FloatingMascots />
              <ReferralTracker />
              <div className="pb-16 sm:pb-0 min-h-screen flex flex-col">
                {children}
              </div>
              <FloatingSupportWidget />
              <MobileBottomNav />
            </LoadingProvider>
          </Suspense>
        </LanguageProvider>
      </body>
    </html>
  );
}
