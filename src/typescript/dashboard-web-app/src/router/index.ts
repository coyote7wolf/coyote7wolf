import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

// Lazy load components
const Login = () => import("@/views/auth/Login.vue");
const Dashboard = () => import("@/views/Dashboard.vue");
const MainLayout = () => import("@/components/layout/MainLayout.vue");
const Collaboration = () => import("@/views/Collaboration.vue");
const Performance = () => import("@/views/Performance.vue");
const AIInsights = () => import("@/views/AIInsights.vue");
const Workspace3D = () => import("@/views/Workspace3D.vue");
const Interactive3D = () => import("@/views/Interactive3D.vue");
const BigDataDemo = () => import("@/views/BigDataDemo.vue");
const Settings = () => import("@/views/Settings.vue");
const TestMSW = () => import("@/views/TestMSW.vue");
const NotFound = () => import("@/views/errors/NotFound.vue");

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      requiresAuth: false,
      title: "Login - SyncCoreAI Dashboard",
    },
  },
  {
    path: "/test-msw",
    name: "TestMSW",
    component: TestMSW,
    meta: {
      requiresAuth: false,
      title: "MSW Test - SyncCoreAI Dashboard",
    },
  },
  {
    path: "/",
    component: MainLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: {
          title: "Dashboard - SyncCoreAI",
          description: "Real-time collaboration analytics and system overview",
        },
      },
      {
        path: "collaboration",
        name: "Collaboration",
        component: Collaboration,
        meta: {
          title: "Collaboration Analytics - SyncCoreAI",
          description:
            "Multi-user collaboration analysis and conflict resolution",
        },
      },
      {
        path: "performance",
        name: "Performance",
        component: Performance,
        meta: {
          title: "System Performance - SyncCoreAI",
          description: "System monitoring and performance metrics",
        },
      },
      {
        path: "ai-insights",
        name: "AIInsights",
        component: AIInsights,
        meta: {
          title: "AI Insights - SyncCoreAI",
          description: "LLM usage statistics and AI collaboration insights",
        },
      },
      {
        path: "3d-workspace",
        name: "Workspace3D",
        component: Workspace3D,
        meta: {
          title: "3D Workspace - SyncCoreAI",
          description: "Immersive 3D collaboration visualization",
        },
      },
      {
        path: "interactive-3d",
        name: "Interactive3D",
        component: Interactive3D,
        meta: {
          title: "Interactive 3D - SyncCoreAI",
          description:
            "Phase 4 - Advanced 3D interactive workspace with VR support",
        },
      },
      {
        path: "big-data-demo",
        name: "BigDataDemo",
        component: BigDataDemo,
        meta: {
          title: "大數據虛擬滾動 - SyncCoreAI",
          description: "Phase 5 - 高性能虛擬滾動大數據列表演示",
        },
      },
      {
        path: "settings",
        name: "Settings",
        component: Settings,
        meta: {
          title: "Settings - SyncCoreAI",
          description: "Application settings and preferences",
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
    meta: {
      title: "Page Not Found - SyncCoreAI",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    } else {
      return { top: 0, behavior: "smooth" };
    }
  },
});

// Navigation guards
router.beforeEach((to, from, next) => {
  // Update document title
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  // Update meta description
  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", to.meta.description as string);
    }
  }

  // Check authentication
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isAuthenticated = localStorage.getItem("authToken");

  if (requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (to.path === "/login" && isAuthenticated) {
    next("/dashboard");
  } else {
    next();
  }
});

// Global error handling for route errors
router.onError((error) => {
  console.error("Router Error:", error);
  // You can send error to monitoring service here
});

export default router;
