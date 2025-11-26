<template>
  <div ref="containerRef" class="performance-dashboard w-full h-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        系統效能監控
      </h3>
      <div class="flex items-center space-x-2">
        <button
          @click="refreshData"
          :disabled="isRefreshing"
          class="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {{ isRefreshing ? "更新中..." : "刷新數據" }}
        </button>
        <button
          @click="toggleAutoRefresh"
          class="px-3 py-1 text-xs rounded-md transition-colors"
          :class="
            autoRefresh
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          "
        >
          {{ autoRefresh ? "停止自動更新" : "開啟自動更新" }}
        </button>
      </div>
    </div>

    <!-- Main Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- CPU Usage -->
      <div class="performance-card">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400">
            CPU 使用率
          </h4>
          <div class="text-xs text-gray-500">
            {{ formatTimestamp(lastUpdate) }}
          </div>
        </div>
        <div class="relative">
          <svg ref="cpuGaugeRef" class="w-full h-24"></svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-2xl font-bold" :class="getMetricColor(cpuUsage)">
                {{ cpuUsage }}%
              </div>
              <div class="text-xs text-gray-500">CPU</div>
            </div>
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          平均: {{ avgCpuUsage }}% | 峰值: {{ maxCpuUsage }}%
        </div>
      </div>

      <!-- Memory Usage -->
      <div class="performance-card">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400">
            記憶體使用率
          </h4>
          <div class="text-xs text-gray-500">
            {{ formatBytes(memoryTotal) }}
          </div>
        </div>
        <div class="relative">
          <svg ref="memoryGaugeRef" class="w-full h-24"></svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div
                class="text-2xl font-bold"
                :class="getMetricColor(memoryUsage)"
              >
                {{ memoryUsage }}%
              </div>
              <div class="text-xs text-gray-500">RAM</div>
            </div>
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          使用: {{ formatBytes(memoryUsed) }} / {{ formatBytes(memoryTotal) }}
        </div>
      </div>

      <!-- Network Throughput -->
      <div class="performance-card">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400">
            網路流量
          </h4>
          <div class="text-xs text-gray-500">即時</div>
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">上傳</span>
            <span class="text-sm font-medium text-blue-600"
              >{{ formatBytes(networkUp) }}/s</span
            >
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-blue-500 h-2 rounded-full transition-all duration-300"
              :style="{
                width: `${Math.min(100, (networkUp / maxNetworkUp) * 100)}%`,
              }"
            ></div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">下載</span>
            <span class="text-sm font-medium text-green-600"
              >{{ formatBytes(networkDown) }}/s</span
            >
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-green-500 h-2 rounded-full transition-all duration-300"
              :style="{
                width: `${Math.min(100, (networkDown / maxNetworkDown) * 100)}%`,
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Response Time -->
      <div class="performance-card">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400">
            API 響應時間
          </h4>
          <div class="text-xs" :class="responseTimeStatus.color">
            {{ responseTimeStatus.text }}
          </div>
        </div>
        <div class="text-center">
          <div
            class="text-2xl font-bold"
            :class="getResponseTimeColor(avgResponseTime)"
          >
            {{ avgResponseTime }}ms
          </div>
          <div class="text-xs text-gray-500 mt-1">平均響應時間</div>
        </div>
        <div class="mt-3 space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">P50</span>
            <span>{{ p50ResponseTime }}ms</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">P95</span>
            <span>{{ p95ResponseTime }}ms</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">P99</span>
            <span>{{ p99ResponseTime }}ms</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Historical Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- CPU & Memory History -->
      <div class="performance-card">
        <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
          系統資源歷史趨勢
        </h4>
        <div
          ref="systemChartRef"
          class="w-full h-48 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <svg ref="systemSvgRef" class="w-full h-full"></svg>
        </div>
        <!-- Legend -->
        <div class="flex justify-center space-x-4 mt-3">
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span class="text-xs text-gray-500">CPU</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <span class="text-xs text-gray-500">記憶體</span>
          </div>
        </div>
      </div>

      <!-- Response Time History -->
      <div class="performance-card">
        <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
          API 響應時間趨勢
        </h4>
        <div
          ref="responseChartRef"
          class="w-full h-48 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <svg ref="responseSvgRef" class="w-full h-full"></svg>
        </div>
        <!-- Legend -->
        <div class="flex justify-center space-x-4 mt-3">
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span class="text-xs text-gray-500">平均響應時間</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
            <span class="text-xs text-gray-500">P95 響應時間</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Service Status -->
    <div class="performance-card">
      <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
        服務狀態監控
      </h4>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        <div
          v-for="service in serviceStatus"
          :key="service.name"
          class="flex items-center space-x-3 p-3 rounded-lg border"
          :class="getServiceStatusClass(service.status)"
        >
          <div
            class="w-3 h-3 rounded-full"
            :class="getServiceStatusIndicator(service.status)"
          ></div>
          <div>
            <div class="text-sm font-medium">{{ service.name }}</div>
            <div class="text-xs text-gray-500">{{ service.uptime }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import * as d3 from "d3";
import type { PerformanceMetrics } from "@/stores/types";

interface Props {
  data: PerformanceMetrics | null;
}

const props = defineProps<Props>();

// Refs
const containerRef = ref<HTMLDivElement>();
const cpuGaugeRef = ref<SVGSVGElement>();
const memoryGaugeRef = ref<SVGSVGElement>();
const systemChartRef = ref<HTMLDivElement>();
const systemSvgRef = ref<SVGSVGElement>();
const responseChartRef = ref<HTMLDivElement>();
const responseSvgRef = ref<SVGSVGElement>();

// State
const isRefreshing = ref(false);
const autoRefresh = ref(true);
const lastUpdate = ref(new Date());
const historicalData = ref<any[]>([]);

// Auto-refresh interval
let refreshInterval: NodeJS.Timeout | null = null;

// Sample data (in real app, this would come from props.data)
const cpuUsage = ref(68);
const avgCpuUsage = ref(72);
const maxCpuUsage = ref(89);
const memoryUsage = ref(54);
const memoryUsed = ref(4.3 * 1024 * 1024 * 1024); // 4.3GB
const memoryTotal = ref(8 * 1024 * 1024 * 1024); // 8GB
const networkUp = ref(1.2 * 1024 * 1024); // 1.2MB/s
const networkDown = ref(2.8 * 1024 * 1024); // 2.8MB/s
const maxNetworkUp = ref(10 * 1024 * 1024); // 10MB/s
const maxNetworkDown = ref(10 * 1024 * 1024); // 10MB/s
const avgResponseTime = ref(245);
const p50ResponseTime = ref(180);
const p95ResponseTime = ref(450);
const p99ResponseTime = ref(680);

const serviceStatus = ref([
  { name: "Auth Service", status: "healthy", uptime: "99.9%" },
  { name: "AI Service", status: "healthy", uptime: "99.8%" },
  { name: "Gateway", status: "healthy", uptime: "99.9%" },
  { name: "Database", status: "warning", uptime: "98.5%" },
  { name: "Redis", status: "healthy", uptime: "99.9%" },
  { name: "Storage", status: "healthy", uptime: "99.7%" },
]);

// Computed
const responseTimeStatus = computed(() => {
  if (avgResponseTime.value < 200) {
    return { text: "良好", color: "text-green-500" };
  } else if (avgResponseTime.value < 500) {
    return { text: "正常", color: "text-yellow-500" };
  } else {
    return { text: "緩慢", color: "text-red-500" };
  }
});

// Methods
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getMetricColor = (value: number): string => {
  if (value < 50) return "text-green-500";
  if (value < 80) return "text-yellow-500";
  return "text-red-500";
};

const getResponseTimeColor = (value: number): string => {
  if (value < 200) return "text-green-500";
  if (value < 500) return "text-yellow-500";
  return "text-red-500";
};

const getServiceStatusClass = (status: string): string => {
  switch (status) {
    case "healthy":
      return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20";
    case "warning":
      return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20";
    case "error":
      return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
    default:
      return "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800";
  }
};

const getServiceStatusIndicator = (status: string): string => {
  switch (status) {
    case "healthy":
      return "bg-green-500 animate-pulse";
    case "warning":
      return "bg-yellow-500 animate-pulse";
    case "error":
      return "bg-red-500 animate-pulse";
    default:
      return "bg-gray-400";
  }
};

const drawGauge = (svgRef: SVGSVGElement, value: number, color: string) => {
  if (!svgRef) return;

  const svg = d3.select(svgRef);
  svg.selectAll("*").remove();

  const width = svgRef.clientWidth || 100;
  const height = svgRef.clientHeight || 60;
  const radius = Math.min(width, height) / 2 - 5;

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height - 5})`);

  // Background arc
  const backgroundArc = d3
    .arc()
    .innerRadius(radius - 8)
    .outerRadius(radius)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2);

  g.append("path")
    .attr("d", backgroundArc as any)
    .attr("fill", "#e5e7eb");

  // Value arc
  const valueArc = d3
    .arc()
    .innerRadius(radius - 8)
    .outerRadius(radius)
    .startAngle(-Math.PI / 2)
    .endAngle(-Math.PI / 2 + (Math.PI * value) / 100);

  g.append("path")
    .attr("d", valueArc as any)
    .attr("fill", color)
    .transition()
    .duration(1000)
    .attrTween("d", function () {
      const interpolate = d3.interpolate(0, value);
      return (t: number) => {
        const angle = -Math.PI / 2 + (Math.PI * interpolate(t)) / 100;
        const arc = d3
          .arc()
          .innerRadius(radius - 8)
          .outerRadius(radius)
          .startAngle(-Math.PI / 2)
          .endAngle(angle);
        return arc() || "";
      };
    });
};

const drawHistoricalChart = (
  svgRef: SVGSVGElement,
  data: any[],
  metrics: string[]
) => {
  if (!svgRef || !data.length) return;

  const svg = d3.select(svgRef);
  svg.selectAll("*").remove();

  const margin = { top: 10, right: 30, bottom: 30, left: 40 };
  const width = svgRef.clientWidth - margin.left - margin.right;
  const height = svgRef.clientHeight - margin.top - margin.bottom;

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Scales
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.timestamp) as [Date, Date])
    .range([0, width]);

  const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

  // Lines
  const line = d3
    .line<any>()
    .x((d) => xScale(d.timestamp))
    .y((d) => yScale(d.value))
    .curve(d3.curveCardinal);

  const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

  metrics.forEach((metric, i) => {
    const lineData = data.map((d) => ({
      timestamp: d.timestamp,
      value: d[metric],
    }));

    g.append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", colors[i])
      .attr("stroke-width", 2)
      .attr("d", line);
  });

  // Axes
  g.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%H:%M")));

  g.append("g").call(d3.axisLeft(yScale));
};

const generateHistoricalData = () => {
  const now = new Date();
  const data: any[] = [];

  for (let i = 30; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 1000); // Every minute
    data.push({
      timestamp,
      cpu: Math.random() * 40 + 30 + Math.sin(i / 5) * 20,
      memory: Math.random() * 30 + 40 + Math.cos(i / 7) * 15,
      responseTime: Math.random() * 200 + 150 + Math.sin(i / 3) * 100,
      p95ResponseTime: Math.random() * 400 + 300 + Math.sin(i / 4) * 200,
    });
  }

  historicalData.value = data;
};

const refreshData = async () => {
  isRefreshing.value = true;

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Update metrics with new random values
  cpuUsage.value = Math.floor(Math.random() * 40 + 30);
  memoryUsage.value = Math.floor(Math.random() * 30 + 40);
  avgResponseTime.value = Math.floor(Math.random() * 200 + 150);
  networkUp.value = Math.random() * 5 * 1024 * 1024;
  networkDown.value = Math.random() * 8 * 1024 * 1024;

  lastUpdate.value = new Date();
  generateHistoricalData();

  // Redraw charts
  drawGauge(cpuGaugeRef.value!, cpuUsage.value, "#3b82f6");
  drawGauge(memoryGaugeRef.value!, memoryUsage.value, "#10b981");
  drawHistoricalChart(systemSvgRef.value!, historicalData.value, [
    "cpu",
    "memory",
  ]);
  drawHistoricalChart(responseSvgRef.value!, historicalData.value, [
    "responseTime",
    "p95ResponseTime",
  ]);

  isRefreshing.value = false;
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;

  if (autoRefresh.value) {
    refreshInterval = setInterval(refreshData, 30000); // 30 seconds
  } else if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

const handleResize = () => {
  // Redraw all charts on resize
  setTimeout(() => {
    drawGauge(cpuGaugeRef.value!, cpuUsage.value, "#3b82f6");
    drawGauge(memoryGaugeRef.value!, memoryUsage.value, "#10b981");
    drawHistoricalChart(systemSvgRef.value!, historicalData.value, [
      "cpu",
      "memory",
    ]);
    drawHistoricalChart(responseSvgRef.value!, historicalData.value, [
      "responseTime",
      "p95ResponseTime",
    ]);
  }, 100);
};

// Lifecycle
onMounted(() => {
  generateHistoricalData();

  // Initial draw
  setTimeout(() => {
    drawGauge(cpuGaugeRef.value!, cpuUsage.value, "#3b82f6");
    drawGauge(memoryGaugeRef.value!, memoryUsage.value, "#10b981");
    drawHistoricalChart(systemSvgRef.value!, historicalData.value, [
      "cpu",
      "memory",
    ]);
    drawHistoricalChart(responseSvgRef.value!, historicalData.value, [
      "responseTime",
      "p95ResponseTime",
    ]);
  }, 100);

  // Start auto-refresh
  if (autoRefresh.value) {
    refreshInterval = setInterval(refreshData, 30000);
  }

  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.performance-card {
  @apply p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700;
}

.performance-dashboard :deep(.tick text) {
  @apply fill-gray-500 text-xs;
}

.performance-dashboard :deep(.domain) {
  @apply stroke-gray-300;
}

.performance-dashboard :deep(.tick line) {
  @apply stroke-gray-300;
}
</style>
