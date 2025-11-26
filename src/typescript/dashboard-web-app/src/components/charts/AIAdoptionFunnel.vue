<template>
  <div class="w-full h-full">
    <div ref="chartContainer" class="w-full h-96"></div>

    <!-- 詳細統計 -->
    <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ data.totalSuggestions }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">AI 總建議數</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ data.viewedSuggestions }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">已查看</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {{ data.consideredSuggestions }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">已考慮</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {{ data.adoptedSuggestions }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">已採用</div>
      </div>
    </div>

    <!-- 轉換率統計 -->
    <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
        <div class="font-semibold text-green-800 dark:text-green-200">
          查看率
          {{
            ((data.viewedSuggestions / data.totalSuggestions) * 100).toFixed(1)
          }}%
        </div>
        <div class="text-green-600 dark:text-green-400 text-xs">
          每個建議平均查看時間: {{ data.averageViewTime }}s
        </div>
      </div>
      <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
        <div class="font-semibold text-yellow-800 dark:text-yellow-200">
          考慮率
          {{
            (
              (data.consideredSuggestions / data.viewedSuggestions) *
              100
            ).toFixed(1)
          }}%
        </div>
        <div class="text-yellow-600 dark:text-yellow-400 text-xs">
          平均考慮時間: {{ data.averageConsiderationTime }}s
        </div>
      </div>
      <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
        <div class="font-semibold text-purple-800 dark:text-purple-200">
          採用率
          {{
            (
              (data.adoptedSuggestions / data.consideredSuggestions) *
              100
            ).toFixed(1)
          }}%
        </div>
        <div class="text-purple-600 dark:text-purple-400 text-xs">
          平均實施時間: {{ data.averageImplementationTime }}h
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as d3 from "d3";

interface Props {
  data: {
    totalSuggestions: number;
    viewedSuggestions: number;
    consideredSuggestions: number;
    adoptedSuggestions: number;
    averageViewTime: number;
    averageConsiderationTime: number;
    averageImplementationTime: number;
    categoryBreakdown: {
      category: string;
      total: number;
      adopted: number;
      color: string;
    }[];
  };
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 400,
});

const chartContainer = ref<HTMLElement>();

let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
let tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;

const createChart = () => {
  if (!chartContainer.value) return;

  // 清除現有圖表
  d3.select(chartContainer.value).selectAll("*").remove();

  const margin = { top: 20, right: 60, bottom: 60, left: 60 };
  const width = props.width - margin.left - margin.right;
  const height = props.height - margin.bottom - margin.top;

  // 創建 SVG
  svg = d3
    .select(chartContainer.value)
    .append("svg")
    .attr("width", props.width)
    .attr("height", props.height);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 漏斗數據
  const funnelData = [
    {
      stage: "AI 建議產生",
      value: props.data.totalSuggestions,
      color: "#3b82f6",
      percentage: 100,
    },
    {
      stage: "用戶查看",
      value: props.data.viewedSuggestions,
      color: "#10b981",
      percentage:
        (props.data.viewedSuggestions / props.data.totalSuggestions) * 100,
    },
    {
      stage: "深度考慮",
      value: props.data.consideredSuggestions,
      color: "#f59e0b",
      percentage:
        (props.data.consideredSuggestions / props.data.totalSuggestions) * 100,
    },
    {
      stage: "實際採用",
      value: props.data.adoptedSuggestions,
      color: "#8b5cf6",
      percentage:
        (props.data.adoptedSuggestions / props.data.totalSuggestions) * 100,
    },
  ];

  // 創建工具提示
  tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "rgba(0, 0, 0, 0.8)")
    .style("color", "white")
    .style("padding", "8px 12px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("z-index", "1000");

  // 計算漏斗形狀
  const maxWidth = width * 0.8;
  const stageHeight = height / funnelData.length;

  funnelData.forEach((d, i) => {
    const stageWidth = (d.value / props.data.totalSuggestions) * maxWidth;
    const x = (width - stageWidth) / 2;
    const y = i * stageHeight;

    // 漏斗形狀（梯形）
    const points = [
      [x, y + 5],
      [x + stageWidth, y + 5],
      [x + stageWidth - 10, y + stageHeight - 5],
      [x + 10, y + stageHeight - 5],
    ];

    // 繪製漏斗段
    const funnelStage = g
      .append("path")
      .datum(d)
      .attr("d", d3.line()(points as [number, number][]) + "Z")
      .attr("fill", d.color)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .style("opacity", 0.8)
      .style("cursor", "pointer");

    // 動畫效果
    funnelStage
      .transition()
      .duration(1000)
      .delay(i * 200)
      .style("opacity", 0.9);

    // 懸停效果
    funnelStage
      .on("mouseenter", function (event, d) {
        d3.select(this).style("opacity", 1);

        tooltip.style("visibility", "visible").html(`
            <div class="font-semibold">${d.stage}</div>
            <div>數量: ${d.value}</div>
            <div>比例: ${d.percentage.toFixed(1)}%</div>
          `);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this).style("opacity", 0.9);
        tooltip.style("visibility", "hidden");
      });

    // 添加文字標籤
    g.append("text")
      .attr("x", width / 2)
      .attr("y", y + stageHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.5)")
      .text(`${d.stage}: ${d.value}`);

    // 添加百分比標籤
    g.append("text")
      .attr("x", width / 2)
      .attr("y", y + stageHeight / 2 + 20)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "white")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.5)")
      .text(`${d.percentage.toFixed(1)}%`);

    // 添加流失率箭頭和標籤
    if (i < funnelData.length - 1) {
      const nextStage = funnelData[i + 1];
      const dropRate = ((d.value - nextStage.value) / d.value) * 100;

      if (dropRate > 0) {
        // 流失箭头
        g.append("path")
          .attr(
            "d",
            `M ${width + 20} ${y + stageHeight / 2} L ${width + 40} ${y + stageHeight / 2 - 5} L ${width + 40} ${y + stageHeight / 2 + 5} Z`
          )
          .attr("fill", "#ef4444")
          .style("opacity", 0.7);

        // 流失率標籤
        g.append("text")
          .attr("x", width + 45)
          .attr("y", y + stageHeight / 2)
          .attr("dy", "0.35em")
          .style("font-size", "11px")
          .style("fill", "#ef4444")
          .style("font-weight", "bold")
          .text(`-${dropRate.toFixed(1)}%`);
      }
    }
  });

  // 添加分類細分圖表
  const categoryG = g
    .append("g")
    .attr("transform", `translate(0, ${height + 40})`);

  const categoryScale = d3
    .scaleBand()
    .domain(props.data.categoryBreakdown.map((d) => d.category))
    .range([0, width])
    .padding(0.1);

  const maxCategoryValue =
    d3.max(props.data.categoryBreakdown, (d) => d.total) || 1;
  const categoryHeight = 30;

  props.data.categoryBreakdown.forEach((category) => {
    const barWidth = categoryScale.bandwidth();
    const totalBarWidth = (category.total / maxCategoryValue) * barWidth;
    const adoptedBarWidth = (category.adopted / maxCategoryValue) * barWidth;

    // 總數條形
    categoryG
      .append("rect")
      .attr("x", categoryScale(category.category))
      .attr("y", 0)
      .attr("width", totalBarWidth)
      .attr("height", categoryHeight)
      .attr("fill", category.color)
      .style("opacity", 0.3);

    // 採用數條形
    categoryG
      .append("rect")
      .attr("x", categoryScale(category.category))
      .attr("y", 0)
      .attr("width", adoptedBarWidth)
      .attr("height", categoryHeight)
      .attr("fill", category.color)
      .style("opacity", 0.8);

    // 類別標籤
    categoryG
      .append("text")
      .attr("x", categoryScale(category.category)! + barWidth / 2)
      .attr("y", categoryHeight + 15)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "currentColor")
      .text(category.category);

    // 數值標籤
    categoryG
      .append("text")
      .attr("x", categoryScale(category.category)! + barWidth / 2)
      .attr("y", categoryHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "9px")
      .style("fill", "white")
      .style("font-weight", "bold")
      .text(`${category.adopted}/${category.total}`);
  });

  console.log("🎯 AI 建議採用率漏斗圖創建完成");
};

// 監聽數據變化
watch(() => props.data, createChart, { deep: true });

onMounted(() => {
  createChart();
});

onUnmounted(() => {
  if (tooltip) {
    tooltip.remove();
  }
});
</script>

<style scoped>
/* 響應式調整 */
@media (max-width: 768px) {
  .grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
