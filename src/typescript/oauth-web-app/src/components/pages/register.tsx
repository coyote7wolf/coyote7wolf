"use client";

import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService, LoginCredentials } from "@/lib/auth.service";
import { useAuthStore } from "@/stores/auth.store";

type FormErrors = Partial<Record<keyof LoginCredentials, string>>;

export function RegisterPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.email) {
      errors.email = t("login.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t("login.invalidEmail");
    }

    if (!formData.password) {
      errors.password = t("login.passwordRequired");
    } else if (formData.password.length < 6) {
      errors.password = t("login.passwordTooShort");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = await AuthService.register(formData);
      setUser(user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || t("common.errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (
    provider: "google" | "github" | "microsoft",
  ) => {
    window.alert(`OAuth signup: ${provider}`);
  };

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

        <form onSubmit={handleSubmit} className="space-y-4 mb-6" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
            >
              {t("common.email")}{" "}
              <span className="text-red-600 dark:text-red-400 ml-1">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="user@example.com"
              aria-invalid={!!validationErrors.email}
              aria-describedby={
                validationErrors.email ? "email-error" : undefined
              }
              className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:focus:ring-blue-400 disabled:opacity-50 ${validationErrors.email ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-slate-600"}`}
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

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1"
            >
              {t("common.password")}{" "}
              <span className="text-red-600 dark:text-red-400 ml-1">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="••••••"
              aria-invalid={!!validationErrors.password}
              aria-describedby={
                validationErrors.password ? "password-error" : undefined
              }
              className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:focus:ring-blue-400 disabled:opacity-50 ${validationErrors.password ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-slate-600"}`}
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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={loading}
              aria-label={t("common.rememberMe")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded disabled:opacity-50"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              {t("common.rememberMe")}
            </label>
          </div>

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

        <div className="space-y-2 mb-6">
          <button
            onClick={() => handleOAuthSignup("google")}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 font-medium"
            aria-label={t("oauth.signupWithGoogle") || "Sign up with Google"}
          >
            <span>🔵</span>
            {t("oauth.signupWithGoogle") || "Sign up with Google"}
          </button>
          <button
            onClick={() => handleOAuthSignup("github")}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 font-medium"
            aria-label={t("oauth.signupWithGithub") || "Sign up with GitHub"}
          >
            <span>⚫</span>
            {t("oauth.signupWithGithub") || "Sign up with GitHub"}
          </button>
          <button
            onClick={() => handleOAuthSignup("microsoft")}
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

export default RegisterPage;
