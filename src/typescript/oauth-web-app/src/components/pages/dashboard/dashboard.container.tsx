"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { AuthService } from "@/lib/auth.service";
import { useEffect, useState } from "react";
import { DashboardView } from "./dashboard.view";

export function DashboardContainer() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = AuthService.getCurrentUser();
    if (!storedUser) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    AuthService.logout();
    logout();
    document.cookie = "auth_user=; path=/";
    router.push("/");
  };

  return (
    <DashboardView user={user} isLoading={isLoading} onLogout={handleLogout} />
  );
}
