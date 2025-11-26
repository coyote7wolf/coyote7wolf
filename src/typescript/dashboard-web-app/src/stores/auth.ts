import { defineStore } from "pinia";
import { ref, computed, readonly } from "vue";
import { authApi } from "./api";
import type { User, LoginCredentials } from "./types";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("authToken"));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userRole = computed(() => user.value?.role || "");
  const userPermissions = computed(() => user.value?.permissions || []);

  // Actions
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true;
    error.value = null;

    console.log("🏪 Auth Store: 嘗試登入", credentials);

    try {
      const response = await authApi.login(credentials);
      console.log("🏪 Auth Store: API 回應", response);

      if (response.success && response.data) {
        user.value = response.data.user;
        token.value = response.data.token;
        localStorage.setItem("authToken", response.data.token);
        console.log("🏪 Auth Store: 登入成功", user.value);
        return true;
      }
      throw new Error(response.message || "Login failed");
    } catch (err: any) {
      console.error("🏪 Auth Store: 登入錯誤", err);
      error.value = err.message || "Login failed";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("authToken");
  };

  const fetchCurrentUser = async () => {
    if (!token.value) return false;

    isLoading.value = true;
    try {
      const response = await authApi.me();
      if (response.success && response.data) {
        user.value = response.data.user;
        return true;
      }
      throw new Error("Failed to fetch user");
    } catch (err: any) {
      console.error("Failed to fetch current user:", err);
      logout();
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const hasPermission = (permission: string) => {
    return userPermissions.value.includes(permission);
  };

  const clearError = () => {
    error.value = null;
  };

  // Initialize store
  const init = async () => {
    if (token.value) {
      await fetchCurrentUser();
    }
  };

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Getters
    isAuthenticated,
    userRole,
    userPermissions,

    // Actions
    login,
    logout,
    fetchCurrentUser,
    hasPermission,
    clearError,
    init,
  };
});
