<template>
  <div ref="containerRef" class="collaboration-heatmap w-full h-full">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        協作熱力圖
      </h3>
      <div class="flex items-center space-x-2">
        <select
          v-model="selectedTimeRange"
          @change="updateTimeRange"
          class="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="1h">過去 1 小時</option>
          <option value="24h">過去 24 小時</option>
          <option value="7d">過去 7 天</option>
        </select>
        <button
          @click="toggleAnimation"
          class="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {{ isAnimating ? "暫停" : "播放" }}
        </button>
      </div>
    </div>

    <!-- SVG Container -->
    <div
      ref="svgContainerRef"
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
    </div>

    <!-- Legend -->
    <div
      class="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400"
    >
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-blue-200 rounded"></div>
          <span>低活躍度</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-blue-500 rounded"></div>
          <span>中等活躍度</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-blue-800 rounded"></div>
          <span>高活躍度</span>
        </div>
      </div>
      <div class="text-xs">總編輯次數: {{ totalEdits }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import * as d3 from "d3";
import type { HeatmapPoint } from "@/stores/types";

interface Props {
  data: HeatmapPoint[];
  width?: number;
  height?: number;
  autoUpdate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  width: 600,
  height: 320,
  autoUpdate: true,
});

// Refs
const containerRef = ref<HTMLDivElement>();
const svgContainerRef = ref<HTMLDivElement>();
const svgRef = ref<SVGSVGElement>();
const tooltipRef = ref<HTMLDivElement>();

// State
const selectedTimeRange = ref("24h");
const isAnimating = ref(false);
const animationId = ref<number>();

// D3 objects
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
let heatmapGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
let colorScale: d3.ScaleSequential<string>;
let xScale: d3.ScaleLinear<number, number>;
let yScale: d3.ScaleLinear<number, number>;

// Computed
const filteredData = computed(() => {
  const now = new Date();
  const timeRanges = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
  };

  const cutoff = new Date(
    now.getTime() -
      timeRanges[selectedTimeRange.value as keyof typeof timeRanges]
  );

  return props.data.filter((point) => new Date(point.timestamp) >= cutoff);
});

const totalEdits = computed(() => {
  return filteredData.value.reduce((sum, point) => sum + point.editCount, 0);
});

// Methods
const initializeD3 = () => {
  if (!svgRef.value || !svgContainerRef.value) return;

  const container = svgContainerRef.value;
  const rect = container.getBoundingClientRect();
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const width = rect.width - margin.left - margin.right;
  const height = rect.height - margin.top - margin.bottom;

  // Clear previous SVG content
  d3.select(svgRef.value).selectAll("*").remove();

  svg = d3
    .select(svgRef.value)
    .attr("viewBox", `0 0 ${rect.width} ${rect.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  heatmapGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Scales
  xScale = d3.scaleLinear().domain([0, 500]).range([0, width]);

  yScale = d3.scaleLinear().domain([0, 400]).range([height, 0]);

  colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 1]);

  // Add axes
  const xAxis = d3.axisBottom(xScale).ticks(5);
  const yAxis = d3.axisLeft(yScale).ticks(5);

  heatmapGroup
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis)
    .selectAll("text")
    .style("fill", "currentColor");

  heatmapGroup
    .append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .selectAll("text")
    .style("fill", "currentColor");

  // Add axis labels
  heatmapGroup
    .append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .style("fill", "currentColor")
    .style("font-size", "12px")
    .text("文件位置 (X)");

  heatmapGroup
    .append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 15)
    .style("fill", "currentColor")
    .style("font-size", "12px")
    .text("文件位置 (Y)");
};

const updateHeatmap = () => {
  if (!heatmapGroup || !filteredData.value.length) return;

  // Create hexagonal bins for better visualization
  const hexRadius = 12;
  const hexbin = d3
    .hexbin<HeatmapPoint>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y))
    .radius(hexRadius);

  const bins = hexbin(filteredData.value);

  // Update color scale domain based on data
  const maxIntensity = d3.max(bins, (d) => d.length) || 1;
  colorScale.domain([0, maxIntensity]);

  // Bind data to hexagons
  const hexagons = heatmapGroup
    .selectAll(".hexagon")
    .data(bins, (d: any) => `${d.x}-${d.y}`);

  // Remove old hexagons
  hexagons.exit().transition().duration(500).attr("opacity", 0).remove();

  // Add new hexagons
  const hexagonsEnter = hexagons
    .enter()
    .append("path")
    .attr("class", "hexagon")
    .attr("d", hexbin.hexagon())
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
    .attr("opacity", 0)
    .style("cursor", "pointer");

  // Update all hexagons
  hexagonsEnter
    .merge(hexagons as any)
    .transition()
    .duration(750)
    .attr("opacity", (d) => (d.length > 0 ? 0.8 : 0))
    .attr("fill", (d) => (d.length > 0 ? colorScale(d.length) : "transparent"))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1);

  // Add interactions
  heatmapGroup
    .selectAll(".hexagon")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick);
};

const handleMouseOver = (event: MouseEvent, d: any) => {
  if (!tooltipRef.value) return;

  const tooltip = d3.select(tooltipRef.value);
  const data = d as d3.HexbinBin<HeatmapPoint>;

  if (data.length === 0) return;

  // Aggregate tooltip information
  const totalEdits = data.reduce((sum, point) => sum + point.editCount, 0);
  const uniqueUsers = new Set(data.map((point) => point.userName)).size;
  const files = new Set(data.map((point) => point.fileName));

  const tooltipContent = `
    <div class="font-semibold mb-1">編輯熱點</div>
    <div>編輯次數: ${totalEdits}</div>
    <div>用戶數: ${uniqueUsers}</div>
    <div>檔案: ${Array.from(files).slice(0, 2).join(", ")}${files.size > 2 ? "..." : ""}</div>
  `;

  tooltip
    .style("opacity", 1)
    .style("left", `${event.offsetX + 10}px`)
    .style("top", `${event.offsetY - 10}px`)
    .select(".tooltip-content")
    .html(tooltipContent);

  // Highlight hexagon
  d3.select(event.currentTarget as SVGPathElement)
    .transition()
    .duration(200)
    .attr("stroke-width", 2)
    .attr("stroke", "#1f2937");
};

const handleMouseOut = (event: MouseEvent) => {
  if (!tooltipRef.value) return;

  d3.select(tooltipRef.value).style("opacity", 0);

  d3.select(event.currentTarget as SVGPathElement)
    .transition()
    .duration(200)
    .attr("stroke-width", 1)
    .attr("stroke", "#fff");
};

const handleClick = (event: MouseEvent, d: any) => {
  const data = d as d3.HexbinBin<HeatmapPoint>;
  if (data.length === 0) return;

  console.log("Clicked heatmap point:", {
    position: { x: d.x, y: d.y },
    editCount: data.length,
    points: data,
  });
};

const updateTimeRange = () => {
  updateHeatmap();
};

const toggleAnimation = () => {
  isAnimating.value = !isAnimating.value;

  if (isAnimating.value) {
    startAnimation();
  } else {
    stopAnimation();
  }
};

const startAnimation = () => {
  let frame = 0;
  const animate = () => {
    frame++;

    // Simple animation: pulse effect on hexagons
    heatmapGroup
      ?.selectAll(".hexagon")
      .transition()
      .duration(1000)
      .attr("opacity", (d) => {
        const data = d as d3.HexbinBin<HeatmapPoint>;
        if (data.length === 0) return 0;
        return 0.6 + 0.2 * Math.sin(frame * 0.1 + data.x * 0.01);
      });

    if (isAnimating.value) {
      animationId.value = requestAnimationFrame(animate);
    }
  };

  animate();
};

const stopAnimation = () => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
    animationId.value = undefined;
  }

  // Reset opacity
  heatmapGroup
    ?.selectAll(".hexagon")
    .transition()
    .duration(500)
    .attr("opacity", (d) => {
      const data = d as d3.HexbinBin<HeatmapPoint>;
      return data.length > 0 ? 0.8 : 0;
    });
};

const handleResize = () => {
  initializeD3();
  updateHeatmap();
};

// Watch for data changes
watch(
  () => filteredData.value,
  () => {
    updateHeatmap();
  },
  { deep: true }
);

// Lifecycle
onMounted(() => {
  initializeD3();
  updateHeatmap();

  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  stopAnimation();
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.collaboration-heatmap :deep(.hexagon) {
  transition: all 0.3s ease;
}

.collaboration-heatmap :deep(.x-axis),
.collaboration-heatmap :deep(.y-axis) {
  font-size: 11px;
}

.collaboration-heatmap :deep(.x-axis path),
.collaboration-heatmap :deep(.y-axis path),
.collaboration-heatmap :deep(.x-axis line),
.collaboration-heatmap :deep(.y-axis line) {
  stroke: currentColor;
  opacity: 0.3;
}
</style>
