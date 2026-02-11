"use client";

import { useTranslation } from "next-i18next";
import { useAuthStore } from "@/stores/auth.store";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeSwitcher } from "./theme-switcher";

/**
 * Navbar Component (Client Component)
 * Features:
 * - Professional UI/UX layout (brand + nav left, actions right)
 * - Responsive navigation
 * - Language switcher
 * - Dark mode toggle
 * - Auth buttons or user menu
 * - Accessible ARIA labels
 */
export function Navbar() {
  const { t } = useTranslation("common");
  const { user } = useAuthStore();

  return (
    <nav
      className="w-full bg-white dark:bg-slate-900 shadow-sm"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand + Primary Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0">
              <a
                href="/"
                className="flex items-center gap-2 text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <span>⚛️</span>
                <span className="hidden sm:inline">React App</span>
              </a>
            </div>

            <div className="hidden md:flex gap-6" role="navigation">
              <a
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                {t("common.home")}
              </a>
              {user && (
                <a
                  href="/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  {t("common.dashboard")}
                </a>
              )}
            </div>
          </div>

          {/* Right: Actions (Theme, Language, Auth) */}
          <div
            className="flex items-center gap-4"
            role="toolbar"
            aria-label="Theme, language, and authentication"
          >
            <ThemeSwitcher />
            <LanguageSwitcher />

            {user ? (
              <a
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm"
              >
                <span>👤</span>
                <span className="hidden sm:inline">
                  {user.name || user.email}
                </span>
              </a>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="/login"
                  className="px-4 py-2 text-black dark:text-black bg-white dark:bg-white border border-gray-300 dark:border-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-100 transition-colors font-medium text-sm"
                >
                  {t("common.login")}
                </a>
                <a
                  href="/register"
                  className="hidden sm:inline-block px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium text-sm"
                >
                  {t("common.register")}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
