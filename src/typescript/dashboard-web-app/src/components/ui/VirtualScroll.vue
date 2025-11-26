<template>
  <div
    ref="containerRef"
    class="virtual-scroll-container"
    :style="{ height: `${height}px`, overflow: 'auto' }"
    @scroll="handleScroll"
  >
    <!-- 虛擬滾動區域 -->
    <div
      class="virtual-scroll-spacer"
      :style="{
        height: `${totalHeight}px`,
        paddingTop: `${offsetY}px`,
        paddingBottom: `${totalHeight - offsetY - visibleHeight}px`,
      }"
    >
      <!-- 可見項目渲染區域 -->
      <div class="virtual-scroll-content">
        <slot
          v-for="item in visibleItems"
          :key="getItemKey(item)"
          :item="item"
          :index="item.index"
        />
      </div>
    </div>

    <!-- 加載指示器 -->
    <div v-if="loading" class="flex items-center justify-center py-4">
      <div
        class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
      ></div>
      <span class="ml-2 text-sm text-gray-600 dark:text-gray-300"
        >載入中...</span
      >
    </div>

    <!-- 滾動到頂部按鈕 -->
    <transition name="fade">
      <button
        v-if="showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-10"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";

// Props
interface Props {
  items: any[];
  itemHeight?: number | ((item: any, index: number) => number);
  height: number;
  overscan?: number;
  loading?: boolean;
  keyField?: string;
  threshold?: number;
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 50,
  overscan: 3,
  loading: false,
  keyField: "id",
  threshold: 200,
});

// Emits
const emit = defineEmits<{
  loadMore: [];
  scroll: [{ scrollTop: number; scrollLeft: number }];
}>();

// Refs
const containerRef = ref<HTMLElement>();
const scrollTop = ref(0);
const showScrollTop = ref(false);

// 項目高度緩存
const itemHeights = new Map<number, number>();
const measuredItems = new Set<number>();

// 獲取項目高度
const getItemHeight = (item: any, index: number): number => {
  if (typeof props.itemHeight === "function") {
    if (!itemHeights.has(index)) {
      const height = props.itemHeight(item, index);
      itemHeights.set(index, height);
    }
    return itemHeights.get(index)!;
  }
  return props.itemHeight as number;
};

// 獲取項目唯一鍵
const getItemKey = (item: any): string | number => {
  if (typeof item === "object" && item !== null) {
    return item[props.keyField] || item.index;
  }
  return item;
};

// 計算總高度
const totalHeight = computed(() => {
  let height = 0;
  for (let i = 0; i < props.items.length; i++) {
    height += getItemHeight(props.items[i], i);
  }
  return height;
});

// 計算可見區域
const visibleRange = computed(() => {
  const containerHeight = props.height;
  const start = Math.max(
    0,
    Math.floor(scrollTop.value / (props.itemHeight as number)) - props.overscan
  );
  const end = Math.min(
    props.items.length - 1,
    Math.ceil(
      (scrollTop.value + containerHeight) / (props.itemHeight as number)
    ) + props.overscan
  );

  return { start, end };
});

// 計算偏移量
const offsetY = computed(() => {
  let offset = 0;
  for (let i = 0; i < visibleRange.value.start; i++) {
    offset += getItemHeight(props.items[i], i);
  }
  return offset;
});

// 計算可見高度
const visibleHeight = computed(() => {
  let height = 0;
  for (let i = visibleRange.value.start; i <= visibleRange.value.end; i++) {
    if (i < props.items.length) {
      height += getItemHeight(props.items[i], i);
    }
  }
  return height;
});

// 可見項目
const visibleItems = computed(() => {
  const items = [];
  for (let i = visibleRange.value.start; i <= visibleRange.value.end; i++) {
    if (i < props.items.length) {
      items.push({
        ...props.items[i],
        index: i,
      });
    }
  }
  return items;
});

// 滾動處理
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  scrollTop.value = target.scrollTop;
  showScrollTop.value = target.scrollTop > 300;

  emit("scroll", {
    scrollTop: target.scrollTop,
    scrollLeft: target.scrollLeft,
  });

  // 檢查是否需要加載更多
  const scrollBottom = target.scrollTop + target.clientHeight;
  const shouldLoadMore = scrollBottom >= target.scrollHeight - props.threshold;

  if (shouldLoadMore && !props.loading) {
    emit("loadMore");
  }
};

// 滾動到頂部
const scrollToTop = () => {
  if (containerRef.value) {
    containerRef.value.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};

// 滾動到指定項目
const scrollToItem = (
  index: number,
  align: "start" | "center" | "end" = "start"
) => {
  if (!containerRef.value || index < 0 || index >= props.items.length) return;

  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += getItemHeight(props.items[i], i);
  }

  const itemHeight = getItemHeight(props.items[index], index);
  const containerHeight = props.height;

  let scrollTop = offset;
  if (align === "center") {
    scrollTop = offset - (containerHeight - itemHeight) / 2;
  } else if (align === "end") {
    scrollTop = offset - containerHeight + itemHeight;
  }

  containerRef.value.scrollTo({
    top: Math.max(0, scrollTop),
    behavior: "smooth",
  });
};

// 測量項目高度（用於動態高度）
const measureItem = async (index: number) => {
  if (typeof props.itemHeight !== "function" || measuredItems.has(index))
    return;

  await nextTick();

  const container = containerRef.value;
  if (!container) return;

  const itemElements = container.querySelectorAll("[data-index]");
  const itemElement = Array.from(itemElements).find(
    (el) => (el as HTMLElement).dataset.index === index.toString()
  ) as HTMLElement;

  if (itemElement) {
    const rect = itemElement.getBoundingClientRect();
    itemHeights.set(index, rect.height);
    measuredItems.add(index);
  }
};

// 重置測量緩存
const resetMeasurements = () => {
  itemHeights.clear();
  measuredItems.clear();
};

// 獲取滾動統計
const getScrollStats = () => {
  return {
    totalItems: props.items.length,
    visibleItems: visibleItems.value.length,
    scrollTop: scrollTop.value,
    totalHeight: totalHeight.value,
    visibleRange: visibleRange.value,
    offsetY: offsetY.value,
  };
};

// 暴露方法給父組件
defineExpose({
  scrollToItem,
  scrollToTop,
  measureItem,
  resetMeasurements,
  getScrollStats,
});

// 監聽項目變化
watch(
  () => props.items.length,
  () => {
    if (typeof props.itemHeight === "function") {
      resetMeasurements();
    }
  }
);

// 生命週期
onMounted(() => {
  console.log("📜 虛擬滾動組件已掛載");
});

onUnmounted(() => {
  resetMeasurements();
});
</script>

<style scoped>
.virtual-scroll-container {
  position: relative;
  contain: strict;
}

.virtual-scroll-spacer {
  position: relative;
  box-sizing: border-box;
}

.virtual-scroll-content {
  position: relative;
}

/* 過渡動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 自定義滾動條 */
.virtual-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

/* 暗黑模式支持 */
.dark .virtual-scroll-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.dark .virtual-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
}

.dark .virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
