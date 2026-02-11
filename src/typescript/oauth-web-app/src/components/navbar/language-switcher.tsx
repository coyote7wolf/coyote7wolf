"use client";

import { useState } from "react";
import { useLanguageStore } from "@/stores/language.store";
import { useTranslation } from "next-i18next";

/**
 * Language Switcher Component (Client Component)
 */
export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguageStore();
  const { i18n } = useTranslation("common");

  const languages = [
    { code: "en", label: "English" },
    { code: "zh-CN", label: "简体中文" },
    { code: "zh-TW", label: "繁體中文" },
    { code: "ar", label: "العربية" },
  ];

  const handleLanguageChange = async (lang: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_language", lang);
    }
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    await i18n.changeLanguage(lang);
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm flex items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        🌐 {language}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-max">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-medium text-sm ${
                language === lang.code
                  ? "bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
