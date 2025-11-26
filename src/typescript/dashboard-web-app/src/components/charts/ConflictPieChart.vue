<template>
  <div ref="containerRef" class="conflict-pie-chart w-full h-full">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        衝突類型分析
      </h3>
      <div class="flex items-center space-x-2">
        <button
          @click="toggleView"
          class="px-3 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          {{ showPercentage ? "顯示數量" : "顯示百分比" }}
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

      <!-- Center Info -->
      <div
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ totalConflicts }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">總衝突數</div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div
        v-for="(item, index) in legendData"
        :key="item.type"
        class="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        @click="highlightSegment(item.type)"
        @mouseenter="highlightSegment(item.type)"
        @mouseleave="resetHighlight"
      >
        <div
          class="w-4 h-4 rounded-full"
          :style="{ backgroundColor: item.color }"
        ></div>
        <div class="flex-1">
          <div class="font-medium text-gray-900 dark:text-white">
            {{ item.label }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ item.count }} 次 ({{ item.percentage }}%)
          </div>
        </div>
      </div>
    </div>

    <!-- Resolution Stats -->
    <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-3">
        解決效率統計
      </h4>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div class="text-center">
          <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
            {{ resolutionStats.average }}s
          </div>
          <div class="text-blue-700 dark:text-blue-300">平均解決時間</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-green-600 dark:text-green-400">
            {{ resolutionStats.autoResolved }}
          </div>
          <div class="text-green-700 dark:text-green-300">自動解決</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            {{ resolutionStats.manualResolved }}
          </div>
          <div class="text-yellow-700 dark:text-yellow-300">手動解決</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-red-600 dark:text-red-400">
            {{ resolutionStats.pending }}
          </div>
          <div class="text-red-700 dark:text-red-300">待處理</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import * as d3 from "d3";
import type { ConflictStats } from "@/stores/types";

interface Props {
  data: ConflictStats | null;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 300,
  height: 300,
});

// Refs
const containerRef = ref<HTMLDivElement>();
const chartContainerRef = ref<HTMLDivElement>();
const svgRef = ref<SVGSVGElement>();
const tooltipRef = ref<HTMLDivElement>();

// State
const showPercentage = ref(false);
const highlightedSegment = ref<string | null>(null);

// D3 objects
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
let chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
let pie: d3.Pie<any, d3.PieArcDatum<any>>;
let arc: d3.Arc<any, d3.PieArcDatum<any>>;
let outerArc: d3.Arc<any, d3.PieArcDatum<any>>;

// Color scheme
const colorScheme = {
  textConflict: "#ef4444", // red-500
  formatConflict: "#f59e0b", // amber-500
  structuralConflict: "#3b82f6", // blue-500
};

// Computed
const chartData = computed(() => {
  if (!props.data) return [];

  return [
    {
      type: "textConflict",
      label: "文字衝突",
      count: props.data.types.textConflict,
      color: colorScheme.textConflict,
    },
    {
      type: "formatConflict",
      label: "格式衝突",
      count: props.data.types.formatConflict,
      color: colorScheme.formatConflict,
    },
    {
      type: "structuralConflict",
      label: "結構衝突",
      count: props.data.types.structuralConflict,
      color: colorScheme.structuralConflict,
    },
  ].filter((item) => item.count > 0);
});

const totalConflicts = computed(() => {
  return chartData.value.reduce((sum, item) => sum + item.count, 0);
});

const legendData = computed(() => {
  return chartData.value.map((item) => ({
    ...item,
    percentage:
      totalConflicts.value > 0
        ? Math.round((item.count / totalConflicts.value) * 100)
        : 0,
  }));
});

const resolutionStats = computed(() => {
  if (!props.data) {
    return {
      average: 0,
      autoResolved: 0,
      manualResolved: 0,
      pending: 0,
    };
  }

  return {
    average: props.data.resolutionTimes.average,
    autoResolved: props.data.autoResolved,
    manualResolved: props.data.manualResolved,
    pending: props.data.pending,
  };
});

// Methods
const initializeD3 = () => {
  if (!svgRef.value || !chartContainerRef.value) return;

  const container = chartContainerRef.value;
  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const radius = Math.min(width, height) / 2 - 40;

  // Clear previous content
  d3.select(svgRef.value).selectAll("*").remove();

  svg = d3
    .select(svgRef.value)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  chartGroup = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Setup pie layout
  pie = d3
    .pie<any>()
    .value((d) => d.count)
    .sort(null)
    .padAngle(0.02);

  // Setup arcs
  arc = d3
    .arc<d3.PieArcDatum<any>>()
    .innerRadius(radius * 0.6) // Donut chart
    .outerRadius(radius);

  outerArc = d3
    .arc<d3.PieArcDatum<any>>()
    .innerRadius(radius * 1.1)
    .outerRadius(radius * 1.1);
};

const updateChart = () => {
  if (!chartGroup || !chartData.value.length) return;

  const pieData = pie(chartData.value);

  // Bind data to arcs
  const arcs = chartGroup
    .selectAll(".arc")
    .data(pieData, (d: any) => d.data.type);

  // Remove old arcs
  arcs
    .exit()
    .transition()
    .duration(500)
    .attrTween("d", function (d: any) {
      const i = d3.interpolate(d, {
        startAngle: d.endAngle,
        endAngle: d.endAngle,
      });
      return (t: number) => arc(i(t)) || "";
    })
    .remove();

  // Add new arcs
  const arcsEnter = arcs.enter().append("g").attr("class", "arc");

  arcsEnter.append("path").attr("class", "arc-path").style("cursor", "pointer");

  arcsEnter
    .append("text")
    .attr("class", "arc-label")
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("fill", "white");

  // Update all arcs
  const arcsUpdate = arcsEnter.merge(arcs as any);

  arcsUpdate
    .select(".arc-path")
    .transition()
    .duration(750)
    .attrTween("d", function (d: any) {
      const currentData = (this as any)._current || {
        startAngle: 0,
        endAngle: 0,
      };
      const i = d3.interpolate(currentData, d);
      (this as any)._current = i(1);
      return (t: number) => arc(i(t)) || "";
    })
    .attr("fill", (d) => d.data.color)
    .attr("stroke", "white")
    .attr("stroke-width", 2);

  // Update labels
  arcsUpdate
    .select(".arc-label")
    .transition()
    .duration(750)
    .attr("transform", (d) => {
      const centroid = arc.centroid(d);
      return `translate(${centroid[0]}, ${centroid[1]})`;
    })
    .text((d) => {
      const percentage = Math.round(
        (d.data.count / totalConflicts.value) * 100
      );
      return showPercentage.value ? `${percentage}%` : d.data.count;
    })
    .style("opacity", (d) => {
      const percentage = (d.data.count / totalConflicts.value) * 100;
      return percentage > 5 ? 1 : 0; // Hide labels for small segments
    });

  // Add interactions
  arcsUpdate
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick);
};

const handleMouseOver = (event: MouseEvent, d: any) => {
  if (!tooltipRef.value) return;

  const tooltip = d3.select(tooltipRef.value);
  const percentage = Math.round((d.data.count / totalConflicts.value) * 100);

  const tooltipContent = `
    <div class="font-semibold mb-1">${d.data.label}</div>
    <div>數量: ${d.data.count}</div>
    <div>佔比: ${percentage}%</div>
  `;

  tooltip
    .style("opacity", 1)
    .style("left", `${event.offsetX + 10}px`)
    .style("top", `${event.offsetY - 10}px`)
    .select(".tooltip-content")
    .html(tooltipContent);

  // Highlight arc
  d3.select(event.currentTarget as SVGGElement)
    .select(".arc-path")
    .transition()
    .duration(200)
    .attr("stroke-width", 3)
    .attr("transform", "scale(1.05)");
};

const handleMouseOut = (event: MouseEvent) => {
  if (!tooltipRef.value) return;

  d3.select(tooltipRef.value).style("opacity", 0);

  d3.select(event.currentTarget as SVGGElement)
    .select(".arc-path")
    .transition()
    .duration(200)
    .attr("stroke-width", 2)
    .attr("transform", "scale(1)");
};

const handleClick = (event: MouseEvent, d: any) => {
  console.log("Clicked conflict type:", d.data);
};

const toggleView = () => {
  showPercentage.value = !showPercentage.value;
  updateChart();
};

const highlightSegment = (type: string) => {
  highlightedSegment.value = type;

  chartGroup
    ?.selectAll(".arc")
    .select(".arc-path")
    .transition()
    .duration(200)
    .attr("opacity", (d: any) => (d.data.type === type ? 1 : 0.3));
};

const resetHighlight = () => {
  highlightedSegment.value = null;

  chartGroup
    ?.selectAll(".arc")
    .select(".arc-path")
    .transition()
    .duration(200)
    .attr("opacity", 1);
};

const handleResize = () => {
  initializeD3();
  updateChart();
};

// Watch for data changes
watch(
  () => props.data,
  () => {
    updateChart();
  },
  { deep: true }
);

watch(showPercentage, () => {
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
.conflict-pie-chart :deep(.arc) {
  transition: all 0.3s ease;
}

.conflict-pie-chart :deep(.arc-path) {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.conflict-pie-chart :deep(.arc-label) {
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
