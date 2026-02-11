import { useTranslation } from "next-i18next";
import { LoginCredentials } from "@/lib/auth.service";

type FormErrors = Partial<Record<keyof LoginCredentials, string>>;

interface RegisterViewProps {
  formData: LoginCredentials;
  loading: boolean;
  error: string;
  validationErrors: FormErrors;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onOAuthSignup: (provider: "google" | "github" | "microsoft") => void;
}

export function RegisterView({
  formData,
  loading,
  error,
  validationErrors,
  onInputChange,
  onSubmit,
  onOAuthSignup,
}: RegisterViewProps) {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("register.title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("register.subtitle") || "Create your account to get started"}
          </p>
        </div>

        {error && (
          <div
            className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            role="alert"
          >
            <span className="inline-block mr-2">⚠️</span>
            <div className="inline">
              <strong className="text-red-800 dark:text-red-200">
                {t("common.error")}:
              </strong>
              <span className="ml-2 text-red-700 dark:text-red-300">
                {error}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 mb-6" noValidate>
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
            >
              {t("common.email")}
              <span
                className="text-red-600 dark:text-red-400 ml-1"
                aria-label="required"
              >
                *
              </span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              required
              disabled={loading}
              placeholder="user@example.com"
              aria-invalid={!!validationErrors.email}
              aria-describedby={
                validationErrors.email ? "email-error" : undefined
              }
              className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:focus:ring-blue-400 disabled:opacity-50 ${
                validationErrors.email
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-slate-600"
              }`}
            />
            {validationErrors.email && (
              <span
                id="email-error"
                className="mt-1 block text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {validationErrors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
            >
              {t("common.password")}
              <span
                className="text-red-600 dark:text-red-400 ml-1"
                aria-label="required"
              >
                *
              </span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={onInputChange}
              required
              disabled={loading}
              placeholder="••••••"
              aria-invalid={!!validationErrors.password}
              aria-describedby={
                validationErrors.password ? "password-error" : undefined
              }
              className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:focus:ring-blue-400 disabled:opacity-50 ${
                validationErrors.password
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-slate-600"
              }`}
            />
            {validationErrors.password && (
              <span
                id="password-error"
                className="mt-1 block text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {validationErrors.password}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <span aria-hidden="true">⏳</span>}
            {loading ? t("common.loading") : t("register.registerButton")}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400">
              Or
            </span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => onOAuthSignup("google")}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 font-medium"
            aria-label={t("oauth.signupWithGoogle") || "Sign up with Google"}
          >
            <span>🔵</span>
            {t("oauth.signupWithGoogle") || "Sign up with Google"}
          </button>
          <button
            onClick={() => onOAuthSignup("github")}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 font-medium"
            aria-label={t("oauth.signupWithGithub") || "Sign up with GitHub"}
          >
            <span>⚫</span>
            {t("oauth.signupWithGithub") || "Sign up with GitHub"}
          </button>
          <button
            onClick={() => onOAuthSignup("microsoft")}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 font-medium"
            aria-label={
              t("oauth.signupWithMicrosoft") || "Sign up with Microsoft"
            }
          >
            <span>🪟</span>
            {t("oauth.signupWithMicrosoft") || "Sign up with Microsoft"}
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          {t("register.alreadyHaveAccount")}{" "}
          <a
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            {t("register.loginLink")}
          </a>
        </p>
      </div>
    </div>
  );
}
