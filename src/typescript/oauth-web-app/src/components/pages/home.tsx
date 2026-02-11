/**
 * Home Page Component (Server Component - RSC)
 *
 * Pure server-side rendering without client-side hooks
 * Runs entirely on the server, no JavaScript sent for this component
 */
export function HomePage() {
  return (
    <div className="w-full">
      <section className="min-h-96 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Our App
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
            A modern React + Next.js application with SSR and i18n support
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md dark:hover:shadow-slate-800 transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🚀 SSR & CSR
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Hydrates instantly with React Server Components
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md dark:hover:shadow-slate-800 transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🌍 i18n Support
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Multi-language support with RTL support for Arabic
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md dark:hover:shadow-slate-800 transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🔐 OAuth Ready
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Built-in OAuth integration with mock providers
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
