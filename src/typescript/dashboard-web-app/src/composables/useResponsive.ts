// 響應式設計工具 - 手機/平板適配 + 觸控手勢 + PWA 準備
import { ref, computed, onMounted, onUnmounted } from "vue";

// 設備類型檢測
export const useDeviceDetection = () => {
  const windowWidth = ref(window.innerWidth);
  const windowHeight = ref(window.innerHeight);
  const touchSupported = ref("ontouchstart" in window);
  const isStandalone = ref(
    window.matchMedia("(display-mode: standalone)").matches
  );

  // 響應式斷點 (Tailwind CSS 標準)
  const breakpoints = {
    sm: 640, // 手機橫屏/小平板
    md: 768, // 平板
    lg: 1024, // 小筆電
    xl: 1280, // 桌面
    "2xl": 1536, // 大螢幕
  };

  // 計算當前設備類型
  const deviceType = computed(() => {
    if (windowWidth.value < breakpoints.sm) return "mobile";
    if (windowWidth.value < breakpoints.md) return "mobile-landscape";
    if (windowWidth.value < breakpoints.lg) return "tablet";
    if (windowWidth.value < breakpoints.xl) return "desktop";
    return "large-desktop";
  });

  // 響應式類別
  const responsiveClasses = computed(() => ({
    isMobile: windowWidth.value < breakpoints.md,
    isTablet:
      windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg,
    isDesktop: windowWidth.value >= breakpoints.lg,
    isLargeScreen: windowWidth.value >= breakpoints.xl,
    isPortrait: windowHeight.value > windowWidth.value,
    isLandscape: windowWidth.value > windowHeight.value,
    touchDevice: touchSupported.value,
    standaloneMode: isStandalone.value,
  }));

  // 動態 CSS 類別字符串
  const deviceClasses = computed(() => {
    const classes = [];
    if (responsiveClasses.value.isMobile) classes.push("device-mobile");
    if (responsiveClasses.value.isTablet) classes.push("device-tablet");
    if (responsiveClasses.value.isDesktop) classes.push("device-desktop");
    if (responsiveClasses.value.touchDevice) classes.push("touch-device");
    if (responsiveClasses.value.isPortrait)
      classes.push("orientation-portrait");
    if (responsiveClasses.value.isLandscape)
      classes.push("orientation-landscape");
    if (responsiveClasses.value.standaloneMode) classes.push("pwa-standalone");
    return classes.join(" ");
  });

  // 更新視窗尺寸
  const updateSize = () => {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
  };

  // 生命週期管理
  onMounted(() => {
    window.addEventListener("resize", updateSize);
    window.addEventListener("orientationchange", updateSize);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateSize);
    window.removeEventListener("orientationchange", updateSize);
  });

  return {
    windowWidth,
    windowHeight,
    deviceType,
    responsiveClasses,
    deviceClasses,
    touchSupported,
    isStandalone,
  };
};

// 觸控手勢支援
export const useTouchGestures = (element: HTMLElement | null) => {
  const startPoint = ref<{ x: number; y: number } | null>(null);
  const currentPoint = ref<{ x: number; y: number } | null>(null);
  const isSwipeing = ref(false);
  const isPinching = ref(false);
  const scale = ref(1);
  const lastTouchDistance = ref(0);

  // 手勢事件處理
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      // 單指觸控
      startPoint.value = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      isSwipeing.value = false;
    } else if (e.touches.length === 2) {
      // 雙指捏合
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      lastTouchDistance.value = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      isPinching.value = true;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && startPoint.value) {
      // 單指滑動
      currentPoint.value = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      const deltaX = currentPoint.value.x - startPoint.value.x;
      const deltaY = currentPoint.value.y - startPoint.value.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 10) {
        isSwipeing.value = true;

        // 發送滑動事件
        const swipeDirection =
          Math.abs(deltaX) > Math.abs(deltaY)
            ? deltaX > 0
              ? "right"
              : "left"
            : deltaY > 0
              ? "down"
              : "up";

        element?.dispatchEvent(
          new CustomEvent("swipe", {
            detail: { direction: swipeDirection, deltaX, deltaY, distance },
          })
        );
      }
    } else if (e.touches.length === 2 && isPinching.value) {
      // 雙指縮放
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      if (lastTouchDistance.value > 0) {
        const newScale =
          scale.value * (currentDistance / lastTouchDistance.value);
        scale.value = Math.max(0.5, Math.min(3, newScale)); // 限制縮放範圍

        element?.dispatchEvent(
          new CustomEvent("pinch", {
            detail: {
              scale: scale.value,
              delta: currentDistance - lastTouchDistance.value,
            },
          })
        );
      }

      lastTouchDistance.value = currentDistance;
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.touches.length === 0) {
      // 檢測是否為有效滑動
      if (isSwipeing.value && startPoint.value && currentPoint.value) {
        const deltaX = currentPoint.value.x - startPoint.value.x;
        const deltaY = currentPoint.value.y - startPoint.value.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = Date.now() - (startPoint.value as any).timestamp || 0;
        const velocity = distance / Math.max(duration, 1);

        if (distance > 50 && velocity > 0.3) {
          // 最小距離和速度閾值
          const direction =
            Math.abs(deltaX) > Math.abs(deltaY)
              ? deltaX > 0
                ? "right"
                : "left"
              : deltaY > 0
                ? "down"
                : "up";

          element?.dispatchEvent(
            new CustomEvent("swipeEnd", {
              detail: { direction, distance, velocity, deltaX, deltaY },
            })
          );
        }
      }

      // 重置狀態
      startPoint.value = null;
      currentPoint.value = null;
      isSwipeing.value = false;
      isPinching.value = false;
    }
  };

  // 綁定觸控事件
  const bindTouchEvents = () => {
    if (element && "ontouchstart" in window) {
      element.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      element.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      element.addEventListener("touchend", handleTouchEnd, { passive: false });
    }
  };

  // 解綁觸控事件
  const unbindTouchEvents = () => {
    if (element) {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    }
  };

  return {
    startPoint,
    currentPoint,
    isSwipeing,
    isPinching,
    scale,
    bindTouchEvents,
    unbindTouchEvents,
  };
};

// PWA 支援工具
export const usePWASupport = () => {
  const isInstallable = ref(false);
  const isInstalled = ref(
    window.matchMedia("(display-mode: standalone)").matches
  );
  const deferredPrompt = ref<any>(null);

  // 檢測 PWA 安裝提示
  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    deferredPrompt.value = e;
    isInstallable.value = true;
    console.log("📱 PWA: 安裝提示已準備");
  };

  // 觸發 PWA 安裝
  const promptInstall = async () => {
    if (!deferredPrompt.value) return false;

    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;

    if (outcome === "accepted") {
      console.log("📱 PWA: 用戶接受安裝");
      isInstallable.value = false;
      isInstalled.value = true;
    } else {
      console.log("📱 PWA: 用戶拒絕安裝");
    }

    deferredPrompt.value = null;
    return outcome === "accepted";
  };

  // 檢測應用安裝狀態
  const handleAppInstalled = () => {
    console.log("📱 PWA: 應用已安裝");
    isInstalled.value = true;
    isInstallable.value = false;
  };

  // 生命週期管理
  onMounted(() => {
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
  });

  onUnmounted(() => {
    window.removeEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );
    window.removeEventListener("appinstalled", handleAppInstalled);
  });

  return {
    isInstallable,
    isInstalled,
    promptInstall,
  };
};

// 自適應佈局工具
export const useAdaptiveLayout = () => {
  const { deviceType, responsiveClasses } = useDeviceDetection();

  // 根據設備類型調整佈局參數
  const layoutConfig = computed(() => {
    const config = {
      // 側邊欄配置
      sidebar: {
        width: responsiveClasses.value.isMobile
          ? "100%"
          : responsiveClasses.value.isTablet
            ? "280px"
            : "320px",
        collapsible:
          responsiveClasses.value.isMobile || responsiveClasses.value.isTablet,
        overlay: responsiveClasses.value.isMobile,
      },

      // 網格佈局
      grid: {
        columns: responsiveClasses.value.isMobile
          ? 1
          : responsiveClasses.value.isTablet
            ? 2
            : 3,
        gap: responsiveClasses.value.isMobile ? "1rem" : "1.5rem",
        padding: responsiveClasses.value.isMobile ? "1rem" : "2rem",
      },

      // 圖表尺寸
      chart: {
        height: responsiveClasses.value.isMobile
          ? "250px"
          : responsiveClasses.value.isTablet
            ? "300px"
            : "400px",
        fontSize: responsiveClasses.value.isMobile ? "12px" : "14px",
        interactive: !responsiveClasses.value.isMobile, // 手機上禁用複雜交互
      },

      // 字體大小
      typography: {
        base: responsiveClasses.value.isMobile ? "14px" : "16px",
        small: responsiveClasses.value.isMobile ? "12px" : "14px",
        large: responsiveClasses.value.isMobile ? "18px" : "20px",
        xl: responsiveClasses.value.isMobile ? "20px" : "24px",
      },
    };

    return config;
  });

  // 動態樣式生成
  const dynamicStyles = computed(() => ({
    "--sidebar-width": layoutConfig.value.sidebar.width,
    "--grid-columns": layoutConfig.value.grid.columns.toString(),
    "--grid-gap": layoutConfig.value.grid.gap,
    "--grid-padding": layoutConfig.value.grid.padding,
    "--chart-height": layoutConfig.value.chart.height,
    "--font-size-base": layoutConfig.value.typography.base,
    "--font-size-small": layoutConfig.value.typography.small,
    "--font-size-large": layoutConfig.value.typography.large,
    "--font-size-xl": layoutConfig.value.typography.xl,
  }));

  return {
    deviceType,
    responsiveClasses,
    layoutConfig,
    dynamicStyles,
  };
};

// 效能最佳化工具
export const usePerformanceOptimization = () => {
  const isLowEndDevice = ref(false);
  const connectionSpeed = ref<"slow" | "fast" | "unknown">("unknown");
  const memoryInfo = ref<any>(null);

  // 檢測設備效能
  const detectDevicePerformance = () => {
    // 檢測記憶體
    if ("memory" in performance) {
      memoryInfo.value = (performance as any).memory;
      // 如果可用記憶體小於 2GB，視為低端設備
      isLowEndDevice.value =
        memoryInfo.value.jsHeapSizeLimit < 2 * 1024 * 1024 * 1024;
    }

    // 檢測網路速度
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      connectionSpeed.value =
        connection.effectiveType === "4g" ? "fast" : "slow";
    }

    console.log("⚡ 效能檢測:", {
      isLowEndDevice: isLowEndDevice.value,
      connectionSpeed: connectionSpeed.value,
      memory: memoryInfo.value,
    });
  };

  // 效能最佳化建議
  const performanceConfig = computed(() => ({
    // 動畫設定
    animations: {
      enabled: !isLowEndDevice.value,
      duration: isLowEndDevice.value ? 150 : 300,
      easing: isLowEndDevice.value ? "ease" : "cubic-bezier(0.4, 0, 0.2, 1)",
    },

    // 圖表設定
    charts: {
      enableTransitions: !isLowEndDevice.value,
      dataPointLimit: isLowEndDevice.value ? 50 : 200,
      refreshRate: isLowEndDevice.value ? 10000 : 5000, // ms
    },

    // 資源載入
    loading: {
      lazyLoad: connectionSpeed.value === "slow",
      preloadImages: connectionSpeed.value === "fast",
      compressionLevel: connectionSpeed.value === "slow" ? "high" : "medium",
    },
  }));

  onMounted(() => {
    detectDevicePerformance();
  });

  return {
    isLowEndDevice,
    connectionSpeed,
    memoryInfo,
    performanceConfig,
  };
};
