<template>
  <div class="space-y-6">
    <PerformanceDashboard :data="performanceData" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PerformanceDashboard from "@/components/charts/PerformanceDashboard.vue";

// Mock performance data (in real app, this would come from store)
const performanceData = computed(() => ({
  cpu: 68,
  memory: 54,
  network: {
    upload: 1.2 * 1024 * 1024, // 1.2MB/s
    download: 2.8 * 1024 * 1024, // 2.8MB/s
  },
  responseTime: {
    average: 245,
    p50: 180,
    p95: 450,
    p99: 680,
  },
  services: [
    { name: "Auth Service", status: "healthy", uptime: "99.9%" },
    { name: "AI Service", status: "healthy", uptime: "99.8%" },
    { name: "Gateway", status: "healthy", uptime: "99.9%" },
    { name: "Database", status: "warning", uptime: "98.5%" },
    { name: "Redis", status: "healthy", uptime: "99.9%" },
    { name: "Storage", status: "healthy", uptime: "99.7%" },
  ],
}));
</script>
