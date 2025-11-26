<template>
  <div ref="containerRef" class="ai-usage-chart w-full h-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        AI 使用趨勢
      </h3>
      <div class="flex items-center space-x-2">
        <select
          v-model="timeRange"
          class="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="24h">最近 24 小時</option>
          <option value="7d">最近 7 天</option>
          <option value="30d">最近 30 天</option>
        </select>
        <button
          @click="toggleSmoothing"
          class="px-3 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          {{ smoothing ? "關閉平滑" : "開啟平滑" }}
        </button>
      </div>
    </div>

    <!-- Chart Container -->
    <div
      ref="chartContainerRef"
      class="w-full h-80 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
    >
      <svg ref="svgRef" class="w-full h-full"></svg>

      <!-- Tooltip -->
      <div
        ref="tooltipRef"
        class="absolute pointer-events-none opacity-0 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10 transition-opacity duration-200"
      >
        <div class="tooltip-content"></div>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-800/80"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
        ></div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-4 flex flex-wrap gap-4 justify-center">
      <div
        v-for="metric in legendMetrics"
        :key="metric.key"
        class="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
        @click="toggleMetric(metric.key)"
        @mouseenter="highlightMetric(metric.key)"
        @mouseleave="resetHighlight"
      >
        <div class="flex items-center space-x-2">
          <div
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: metric.color }"
            :class="{ 'opacity-30': hiddenMetrics.has(metric.key) }"
          ></div>
          <span
            class="text-sm font-medium"
            :class="[
              hiddenMetrics.has(metric.key)
                ? 'text-gray-400'
                : 'text-gray-700 dark:text-gray-300',
            ]"
          >
            {{ metric.label }}
          </span>
        </div>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatValue(metric.currentValue) }}
        </span>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div
        class="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg"
      >
        <div class="text-sm text-blue-600 dark:text-blue-400 font-medium">
          總請求數
        </div>
        <div class="text-xl font-bold text-blue-700 dark:text-blue-300">
          {{ formatValue(summaryStats.totalRequests) }}
        </div>
        <div class="text-xs text-blue-500 dark:text-blue-400">
          較昨日 {{ summaryStats.requestsChange >= 0 ? "+" : ""
          }}{{ summaryStats.requestsChange }}%
        </div>
      </div>

      <div
        class="p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg"
      >
        <div class="text-sm text-green-600 dark:text-green-400 font-medium">
          成功率
        </div>
        <div class="text-xl font-bold text-green-700 dark:text-green-300">
          {{ summaryStats.successRate }}%
        </div>
        <div class="text-xs text-green-500 dark:text-green-400">
          較昨日 {{ summaryStats.successRateChange >= 0 ? "+" : ""
          }}{{ summaryStats.successRateChange }}%
        </div>
      </div>

      <div
        class="p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg"
      >
        <div class="text-sm text-purple-600 dark:text-purple-400 font-medium">
          平均響應時間
        </div>
        <div class="text-xl font-bold text-purple-700 dark:text-purple-300">
          {{ summaryStats.avgResponseTime }}ms
        </div>
        <div class="text-xs text-purple-500 dark:text-purple-400">
          較昨日 {{ summaryStats.responseTimeChange >= 0 ? "+" : ""
          }}{{ summaryStats.responseTimeChange }}%
        </div>
      </div>

      <div
        class="p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg"
      >
        <div class="text-sm text-orange-600 dark:text-orange-400 font-medium">
          錯誤率
        </div>
        <div class="text-xl font-bold text-orange-700 dark:text-orange-300">
          {{ summaryStats.errorRate }}%
        </div>
        <div class="text-xs text-orange-500 dark:text-orange-400">
          較昨日 {{ summaryStats.errorRateChange >= 0 ? "+" : ""
          }}{{ summaryStats.errorRateChange }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import * as d3 from "d3";
import type { AIUsageStats } from "@/stores/types";

interface Props {
  data: AIUsageStats | null;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 320,
});

// Refs
const containerRef = ref<HTMLDivElement>();
const chartContainerRef = ref<HTMLDivElement>();
const svgRef = ref<SVGSVGElement>();
const tooltipRef = ref<HTMLDivElement>();

// State
const timeRange = ref("24h");
const smoothing = ref(true);
const isLoading = ref(false);
const hiddenMetrics = ref(new Set<string>());
const highlightedMetric = ref<string | null>(null);

// D3 objects
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
let chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
let xScale: d3.ScaleTime<number, number>;
let yScale: d3.ScaleLinear<number, number>;
let line: d3.Line<any>;
let smoothLine: d3.Line<any>;

// Color scheme for different metrics
const colorScheme = {
  requests: "#3b82f6", // blue-500
  successRate: "#10b981", // emerald-500
  responseTime: "#8b5cf6", // violet-500
  errorRate: "#f59e0b", // amber-500
};

// Computed
const chartData = computed(() => {
  if (!props.data) return [];

  const now = new Date();
  let hours = 24;

  switch (timeRange.value) {
    case "7d":
      hours = 24 * 7;
      break;
    case "30d":
      hours = 24 * 30;
      break;
  }

  // Generate sample data points
  const points: any[] = [];
  const interval = hours <= 24 ? 1 : hours <= 168 ? 6 : 24; // hours between points

  for (let i = hours; i >= 0; i -= interval) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseValue = Math.sin((i / hours) * Math.PI * 2) * 0.3 + 0.7;

    points.push({
      timestamp,
      requests: Math.floor(
        props.data.requests * baseValue + Math.random() * 100
      ),
      successRate: Math.min(
        100,
        Math.max(
          80,
          props.data.successRate * baseValue + (Math.random() - 0.5) * 10
        )
      ),
      responseTime: Math.max(
        50,
        props.data.responseTime * (2 - baseValue) + (Math.random() - 0.5) * 100
      ),
      errorRate: Math.max(
        0,
        Math.min(
          20,
          (100 - props.data.successRate) * (2 - baseValue) +
            (Math.random() - 0.5) * 5
        )
      ),
    });
  }

  return points;
});

const legendMetrics = computed(() => [
  {
    key: "requests",
    label: "API 請求數",
    color: colorScheme.requests,
    currentValue: chartData.value[chartData.value.length - 1]?.requests || 0,
  },
  {
    key: "successRate",
    label: "成功率 (%)",
    color: colorScheme.successRate,
    currentValue: chartData.value[chartData.value.length - 1]?.successRate || 0,
  },
  {
    key: "responseTime",
    label: "響應時間 (ms)",
    color: colorScheme.responseTime,
    currentValue:
      chartData.value[chartData.value.length - 1]?.responseTime || 0,
  },
  {
    key: "errorRate",
    label: "錯誤率 (%)",
    color: colorScheme.errorRate,
    currentValue: chartData.value[chartData.value.length - 1]?.errorRate || 0,
  },
]);

const summaryStats = computed(() => {
  if (!props.data || !chartData.value.length) {
    return {
      totalRequests: 0,
      successRate: 0,
      avgResponseTime: 0,
      errorRate: 0,
      requestsChange: 0,
      successRateChange: 0,
      responseTimeChange: 0,
      errorRateChange: 0,
    };
  }

  const latest = chartData.value[chartData.value.length - 1];
  const previous = chartData.value[Math.max(0, chartData.value.length - 2)];

  return {
    totalRequests: chartData.value.reduce((sum, d) => sum + d.requests, 0),
    successRate: Math.round(latest.successRate),
    avgResponseTime: Math.round(latest.responseTime),
    errorRate: Math.round(latest.errorRate),
    requestsChange: previous
      ? Math.round(
          ((latest.requests - previous.requests) / previous.requests) * 100
        )
      : 0,
    successRateChange: previous
      ? Math.round(
          ((latest.successRate - previous.successRate) / previous.successRate) *
            100
        )
      : 0,
    responseTimeChange: previous
      ? Math.round(
          ((latest.responseTime - previous.responseTime) /
            previous.responseTime) *
            100
        )
      : 0,
    errorRateChange: previous
      ? Math.round(
          ((latest.errorRate - previous.errorRate) / previous.errorRate) * 100
        )
      : 0,
  };
});

// Methods
const formatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return Math.round(value).toString();
};

const initializeD3 = () => {
  if (!svgRef.value || !chartContainerRef.value) return;

  const container = chartContainerRef.value;
  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };

  // Clear previous content
  d3.select(svgRef.value).selectAll("*").remove();

  svg = d3
    .select(svgRef.value)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  chartGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Setup scales
  xScale = d3.scaleTime().range([0, chartWidth]);

  yScale = d3.scaleLinear().range([chartHeight, 0]);

  // Setup line generators
  line = d3
    .line<any>()
    .x((d) => xScale(d.timestamp))
    .y((d) => yScale(d.value))
    .curve(d3.curveLinear);

  smoothLine = d3
    .line<any>()
    .x((d) => xScale(d.timestamp))
    .y((d) => yScale(d.value))
    .curve(d3.curveCardinal.tension(0.3));

  // Add axes
  chartGroup
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${chartHeight})`);

  chartGroup.append("g").attr("class", "y-axis");

  // Add grid lines
  chartGroup
    .append("g")
    .attr("class", "grid-x")
    .attr("transform", `translate(0, ${chartHeight})`);

  chartGroup.append("g").attr("class", "grid-y");
};

const updateChart = () => {
  if (!chartGroup || !chartData.value.length) return;

  // Update scales
  const xExtent = d3.extent(chartData.value, (d) => d.timestamp) as [
    Date,
    Date,
  ];
  xScale.domain(xExtent);

  // Calculate y domain for all visible metrics
  const allValues: number[] = [];
  legendMetrics.value.forEach((metric) => {
    if (!hiddenMetrics.value.has(metric.key)) {
      chartData.value.forEach((d) => {
        allValues.push(d[metric.key]);
      });
    }
  });

  const yExtent = d3.extent(allValues) as [number, number];
  yScale.domain([Math.max(0, yExtent[0] * 0.9), yExtent[1] * 1.1]);

  // Update axes
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat(d3.timeFormat(timeRange.value === "24h" ? "%H:%M" : "%m/%d"));

  const yAxis = d3.axisLeft(yScale).tickFormat((d) => formatValue(d as number));

  chartGroup
    .select(".x-axis")
    .transition()
    .duration(750)
    .call(xAxis as any);

  chartGroup
    .select(".y-axis")
    .transition()
    .duration(750)
    .call(yAxis as any);

  // Update grid
  chartGroup
    .select(".grid-x")
    .transition()
    .duration(750)
    .call(
      d3
        .axisBottom(xScale)
        .tickSize(-yScale.range()[0])
        .tickFormat(() => "")
    )
    .selectAll("line")
    .attr("stroke", "#e5e7eb")
    .attr("stroke-width", 0.5);

  chartGroup
    .select(".grid-y")
    .transition()
    .duration(750)
    .call(
      d3
        .axisLeft(yScale)
        .tickSize(-xScale.range()[1])
        .tickFormat(() => "")
    )
    .selectAll("line")
    .attr("stroke", "#e5e7eb")
    .attr("stroke-width", 0.5);

  // Draw lines for each metric
  legendMetrics.value.forEach((metric) => {
    if (hiddenMetrics.value.has(metric.key)) return;

    const lineData = chartData.value.map((d) => ({
      timestamp: d.timestamp,
      value: d[metric.key],
    }));

    const lineGenerator = smoothing.value ? smoothLine : line;
    const pathClass = `line-${metric.key}`;

    // Remove existing line
    chartGroup.selectAll(`.${pathClass}`).remove();

    // Add new line
    const linePath = chartGroup
      .append("path")
      .datum(lineData)
      .attr("class", pathClass)
      .attr("fill", "none")
      .attr("stroke", metric.color)
      .attr("stroke-width", highlightedMetric.value === metric.key ? 3 : 2)
      .attr(
        "opacity",
        highlightedMetric.value && highlightedMetric.value !== metric.key
          ? 0.3
          : 1
      )
      .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))");

    // Animate line drawing
    const totalLength =
      (linePath.node() as SVGPathElement)?.getTotalLength() || 0;
    linePath
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .attr("d", lineGenerator as any)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Add data points
    const pointsGroup = chartGroup
      .selectAll(`.points-${metric.key}`)
      .data([lineData])
      .join("g")
      .attr("class", `points-${metric.key}`);

    const points = pointsGroup
      .selectAll(".data-point")
      .data(lineData)
      .join("circle")
      .attr("class", "data-point")
      .attr("cx", (d) => xScale(d.timestamp))
      .attr("cy", (d) => yScale(d.value))
      .attr("r", 0)
      .attr("fill", metric.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style(
        "opacity",
        highlightedMetric.value && highlightedMetric.value !== metric.key
          ? 0.3
          : 1
      );

    points
      .transition()
      .delay((d, i) => i * 50)
      .duration(300)
      .attr("r", 4);

    // Add hover interactions
    points
      .on("mouseover", (event, d) => handlePointMouseOver(event, d, metric))
      .on("mouseout", handlePointMouseOut);
  });
};

const handlePointMouseOver = (event: MouseEvent, d: any, metric: any) => {
  if (!tooltipRef.value) return;

  const tooltip = d3.select(tooltipRef.value);
  const timeFormat = d3.timeFormat("%Y-%m-%d %H:%M");

  const tooltipContent = `
    <div class="font-semibold mb-1">${metric.label}</div>
    <div>時間: ${timeFormat(d.timestamp)}</div>
    <div>數值: ${formatValue(d.value)}${metric.key === "successRate" || metric.key === "errorRate" ? "%" : metric.key === "responseTime" ? "ms" : ""}</div>
  `;

  tooltip
    .style("opacity", 1)
    .style("left", `${event.offsetX + 10}px`)
    .style("top", `${event.offsetY - 10}px`)
    .select(".tooltip-content")
    .html(tooltipContent);

  // Highlight point
  d3.select(event.currentTarget as SVGCircleElement)
    .transition()
    .duration(200)
    .attr("r", 6);
};

const handlePointMouseOut = (event: MouseEvent) => {
  if (!tooltipRef.value) return;

  d3.select(tooltipRef.value).style("opacity", 0);

  d3.select(event.currentTarget as SVGCircleElement)
    .transition()
    .duration(200)
    .attr("r", 4);
};

const toggleMetric = (metricKey: string) => {
  if (hiddenMetrics.value.has(metricKey)) {
    hiddenMetrics.value.delete(metricKey);
  } else {
    hiddenMetrics.value.add(metricKey);
  }
  updateChart();
};

const highlightMetric = (metricKey: string) => {
  highlightedMetric.value = metricKey;
  updateChart();
};

const resetHighlight = () => {
  highlightedMetric.value = null;
  updateChart();
};

const toggleSmoothing = () => {
  smoothing.value = !smoothing.value;
  updateChart();
};

const handleResize = () => {
  initializeD3();
  updateChart();
};

// Watch for changes
watch(
  () => props.data,
  () => {
    updateChart();
  },
  { deep: true }
);

watch(timeRange, () => {
  isLoading.value = true;
  setTimeout(() => {
    updateChart();
    isLoading.value = false;
  }, 500);
});

watch(smoothing, () => {
  updateChart();
});

// Lifecycle
onMounted(() => {
  initializeD3();
  updateChart();

  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.ai-usage-chart :deep(.x-axis),
.ai-usage-chart :deep(.y-axis) {
  font-size: 12px;
  color: #6b7280;
}

.ai-usage-chart :deep(.grid-x line),
.ai-usage-chart :deep(.grid-y line) {
  stroke: #e5e7eb;
  stroke-dasharray: 2, 2;
}

.ai-usage-chart :deep(.data-point) {
  transition: all 0.2s ease;
}

.ai-usage-chart :deep(.data-point:hover) {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}
</style>
