"use client";

import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { Navbar } from "../navbar/navbar";
import { Footer } from "./footer";
import { initializeAuthState, initializeLanguage } from "@/lib/hydration";
import { useLanguageStore } from "@/stores/language.store";
import i18n from "@/lib/i18n";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { setLanguage } = useLanguageStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Initialize auth and language state immediately on mount
    const initializeState = async () => {
      await initializeAuthState();
      const language = await initializeLanguage();

      // Update the store immediately to sync with navbar
      setLanguage(language);

      // Set language in i18n if different from current
      if (language && language !== i18n.language) {
        await i18n.changeLanguage(language);
      }

      // Ensure language direction is set
      if (language) {
        document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = language;
      }
      // Mark ready so pages render only after language/init is applied
      setReady(true);
    };

    initializeState();
  }, [setLanguage]);

  // Wrap content in I18nextProvider after hydration is complete
  return (
    <I18nextProvider i18n={i18n}>
      <div className="min-h-screen flex flex-col">
        {ready ? <Navbar /> : <div className="h-16" aria-hidden />}

        <main className="flex-grow">
          {ready ? (
            children
          ) : (
            <div className="flex items-center justify-center h-full p-8 text-gray-500 dark:text-gray-400">
              加載中...
            </div>
          )}
        </main>

        {ready ? <Footer /> : <div className="h-24" aria-hidden />}
      </div>
    </I18nextProvider>
  );
}
