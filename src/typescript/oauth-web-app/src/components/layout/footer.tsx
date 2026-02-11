"use client";

/**
 * Footer Component
 * Simple copyright footer
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 py-2 px-4 mt-auto text-center text-xs text-gray-600 dark:text-gray-400">
      <div className="max-w-6xl mx-auto">
        <p className="m-0 opacity-90">
          © {currentYear} React Web App. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
