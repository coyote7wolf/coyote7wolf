import { createPinia } from "pinia";

// Create pinia instance
export const pinia = createPinia();

// Export all stores
export { useAuthStore } from "./auth";
export { useDashboardStore } from "./dashboard";
export { useCollaborationStore } from "./collaboration";
export { useAIStore } from "./ai";

// Export types
export * from "./types";
