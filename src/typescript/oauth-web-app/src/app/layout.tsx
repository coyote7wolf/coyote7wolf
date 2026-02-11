import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { ClientLayout } from "@/components/layout/client-layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "React Web App",
  description: "React + Next.js web app with SSR and i18n support",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale?: string }>;
}

/**
 * Root Layout (Server Component)
 *
 * This is a React Server Component that handles:
 * - Initial metadata and document setup
 * - Server-side rendering of HTML structure
 * - Preventing hydration mismatch by not reading client state here
 */
export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale = "en" } = await params;

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{const stored=localStorage.getItem('theme');const isDark=stored==='dark'||(stored===null&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(isDark){document.documentElement.classList.add('dark')}const currentLang=document.documentElement.lang;const savedLang=localStorage.getItem('app_language');if(savedLang&&savedLang!==currentLang){document.documentElement.lang=savedLang;document.documentElement.dir=savedLang==='ar'?'rtl':'ltr'}}catch(e){}})()",
          }}
          suppressHydrationWarning
        />
      </head>
      <body suppressHydrationWarning>
        {/* ClientLayout is a Client Component that handles interactivity */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
