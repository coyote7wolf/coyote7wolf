"use client";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { AuthService } from "@/lib/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export function AuthCallbackPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const provider = searchParams.get("provider") as
          | "google"
          | "github"
          | "microsoft"
          | null;
        const email = searchParams.get("email");
        const name = searchParams.get("name");

        if (provider && email) {
          const user = await AuthService.handleOAuthCallback(provider, {
            email,
            name: name || undefined,
          });
          setUser(user);
          document.cookie = `auth_user=${JSON.stringify(user)}; path=/`;
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push("/login");
      }
    };

    handleCallback();
  }, [searchParams, setUser, router]);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p>{t("common.loading")}</p>
    </div>
  );
}
