"use client";

import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService, LoginCredentials } from "@/lib/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { RegisterView } from "./register.view";

type FormErrors = Partial<Record<keyof LoginCredentials, string>>;

export function RegisterContainer() {
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
    if (validationErrors[name as keyof LoginCredentials]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const user = await AuthService.login(formData);
      setUser(user);
      document.cookie = `auth_user=${JSON.stringify(user)}; path=/`;
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (
    provider: "google" | "github" | "microsoft",
  ) => {
    setLoading(true);
    setError("");

    try {
      const user = await AuthService.handleOAuthCallback(provider, {
        email: `${provider}@example.com`,
        name: `${provider} User`,
      });
      setUser(user);
      document.cookie = `auth_user=${JSON.stringify(user)}; path=/`;
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterView
      formData={formData}
      loading={loading}
      error={error}
      validationErrors={validationErrors}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      onOAuthSignup={handleOAuthSignup}
    />
  );
}
