import { useTranslation } from "next-i18next";
import { User } from "@/stores/auth.store";

interface DashboardViewProps {
  user: User | null;
  isLoading: boolean;
  onLogout: () => void;
}

export function DashboardView({
  user,
  isLoading,
  onLogout,
}: DashboardViewProps) {
  const { t } = useTranslation("common");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-400">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {t("dashboard.welcome")}
        </h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          {t("dashboard.logoutButton")}
        </button>
      </div>

      <section className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t("dashboard.userInfo")}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("common.email")}
            </label>
            <p className="text-gray-900 dark:text-gray-100 font-semibold">
              {user?.email || "N/A"}
            </p>
          </div>
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("common.profile")}
            </label>
            <p className="text-gray-900 dark:text-gray-100 font-semibold">
              {user?.name || "N/A"}
            </p>
          </div>
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Provider
            </label>
            <p className="text-gray-900 dark:text-gray-100 font-semibold">
              {user?.provider || "N/A"}
            </p>
          </div>
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID
            </label>
            <p className="text-gray-900 dark:text-gray-100 font-semibold">
              {user?.id || "N/A"}
            </p>
          </div>
        </div>
      </section>

      {user?.avatar && (
        <section className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Avatar
          </h2>
          <img
            src={user.avatar}
            alt="User avatar"
            className="max-w-xs h-auto rounded-lg"
          />
        </section>
      )}
    </div>
  );
}
