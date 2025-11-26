/**
 * 漸進式載入管理器 - Phase 5 高性能資源載入
 * 提供圖片懶加載、資源預加載、程式碼分割等功能
 */

export interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number | number[];
  enablePlaceholder?: boolean;
  placeholderColor?: string;
  fadeInDuration?: number;
}

export interface PreloadOptions {
  priority?: "high" | "low";
  crossOrigin?: "anonymous" | "use-credentials";
  as?: "image" | "script" | "style" | "font";
}

export interface ProgressiveLoadingStats {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  cacheHitRate: number;
}

class ProgressiveLoadingManager {
  private observer: IntersectionObserver | null = null;
  private loadingImages = new Map<string, HTMLImageElement>();
  private imageCache = new Map<string, string>();
  private loadTimes = new Map<string, number>();
  private failedUrls = new Set<string>();
  private stats: ProgressiveLoadingStats = {
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    cacheHitRate: 0,
  };

  private defaultOptions: LazyLoadOptions = {
    rootMargin: "50px",
    threshold: 0.1,
    enablePlaceholder: true,
    placeholderColor: "#f3f4f6",
    fadeInDuration: 300,
  };

  constructor() {
    this.initializeObserver();
    this.setupPreloadLink();
    console.log("📷 Progressive Loading Manager initialized");
  }

  /**
   * 初始化 Intersection Observer
   */
  private initializeObserver(): void {
    if (!("IntersectionObserver" in window)) {
      console.warn(
        "IntersectionObserver not supported, falling back to immediate loading"
      );
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: this.defaultOptions.rootMargin,
        threshold: this.defaultOptions.threshold,
      }
    );
  }

  /**
   * 設置預加載 link 標籤
   */
  private setupPreloadLink(): void {
    // 添加 DNS 預解析
    const dnsPreconnects = [
      "https://images.unsplash.com",
      "https://cdn.jsdelivr.net",
      "https://fonts.googleapis.com",
    ];

    dnsPreconnects.forEach((domain) => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  /**
   * 處理元素進入視窗
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        this.loadImage(img);
        this.observer?.unobserve(img);
      }
    });
  }

  /**
   * 懶加載圖片
   */
  lazyLoadImage(img: HTMLImageElement, options: LazyLoadOptions = {}): void {
    const opts = { ...this.defaultOptions, ...options };

    // 檢查是否已經載入
    if (img.complete && img.naturalHeight !== 0) {
      return;
    }

    // 設置 data 屬性
    if (!img.dataset.src && img.src) {
      img.dataset.src = img.src;
      img.src = "";
    }

    // 設置占位符
    if (opts.enablePlaceholder && !img.src) {
      this.setPlaceholder(img, opts.placeholderColor!);
    }

    // 添加到觀察器
    if (this.observer) {
      this.observer.observe(img);
    } else {
      // 回退到立即載入
      this.loadImage(img);
    }

    this.stats.totalImages++;
  }

  /**
   * 載入圖片
   */
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (!src) return;

    const startTime = performance.now();

    // 檢查快取
    if (this.imageCache.has(src)) {
      this.applyImage(img, this.imageCache.get(src)!);
      this.stats.cacheHitRate = this.imageCache.size / this.stats.totalImages;
      return;
    }

    // 檢查是否已經在載入中
    if (this.loadingImages.has(src)) {
      return;
    }

    // 創建新的圖片對象載入
    const newImg = new Image();
    this.loadingImages.set(src, newImg);

    newImg.onload = () => {
      const loadTime = performance.now() - startTime;
      this.loadTimes.set(src, loadTime);

      // 添加到快取
      this.imageCache.set(src, src);

      // 應用圖片
      this.applyImage(img, src);

      // 清理
      this.loadingImages.delete(src);

      // 更新統計
      this.stats.loadedImages++;
      this.updateAverageLoadTime();

      console.log(`📷 Image loaded: ${src} (${loadTime.toFixed(2)}ms)`);
    };

    newImg.onerror = () => {
      console.error(`❌ Failed to load image: ${src}`);
      this.failedUrls.add(src);
      this.loadingImages.delete(src);
      this.stats.failedImages++;

      // 設置錯誤占位符
      this.setErrorPlaceholder(img);
    };

    newImg.src = src;
  }

  /**
   * 應用圖片到元素
   */
  private applyImage(img: HTMLImageElement, src: string): void {
    img.src = src;
    img.classList.add("loaded");

    // 淡入效果
    if (this.defaultOptions.fadeInDuration! > 0) {
      img.style.opacity = "0";
      img.style.transition = `opacity ${this.defaultOptions.fadeInDuration}ms ease-in-out`;

      requestAnimationFrame(() => {
        img.style.opacity = "1";
      });
    }
  }

  /**
   * 設置占位符
   */
  private setPlaceholder(img: HTMLImageElement, color: string): void {
    const width = img.getAttribute("width") || "300";
    const height = img.getAttribute("height") || "200";

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui" font-size="14">
          載入中...
        </text>
      </svg>
    `;

    img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * 設置錯誤占位符
   */
  private setErrorPlaceholder(img: HTMLImageElement): void {
    const width = img.getAttribute("width") || "300";
    const height = img.getAttribute("height") || "200";

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#fee2e2"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#dc2626" font-family="system-ui" font-size="14">
          載入失敗
        </text>
      </svg>
    `;

    img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * 預加載資源
   */
  preloadResource(url: string, options: PreloadOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = url;

      if (options.as) {
        link.as = options.as;
      }

      if (options.crossOrigin) {
        link.crossOrigin = options.crossOrigin;
      }

      link.onload = () => {
        console.log(`✅ Preloaded: ${url}`);
        resolve();
      };

      link.onerror = () => {
        console.error(`❌ Failed to preload: ${url}`);
        reject(new Error(`Failed to preload: ${url}`));
      };

      document.head.appendChild(link);
    });
  }

  /**
   * 批量預加載圖片
   */
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map((url) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          this.imageCache.set(url, url);
          resolve();
        };
        img.onerror = () =>
          reject(new Error(`Failed to preload image: ${url}`));
        img.src = url;
      });
    });

    try {
      await Promise.all(promises);
      console.log(`✅ Preloaded ${urls.length} images`);
    } catch (error) {
      console.warn("Some images failed to preload:", error);
    }
  }

  /**
   * 動態載入 JavaScript 模組
   */
  async loadModule<T = any>(modulePath: string): Promise<T> {
    try {
      const startTime = performance.now();
      const module = await import(modulePath);
      const loadTime = performance.now() - startTime;

      console.log(`📦 Module loaded: ${modulePath} (${loadTime.toFixed(2)}ms)`);
      return module;
    } catch (error) {
      console.error(`❌ Failed to load module: ${modulePath}`, error);
      throw error;
    }
  }

  /**
   * 動態載入 CSS
   */
  loadCSS(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;

      link.onload = () => {
        console.log(`🎨 CSS loaded: ${href}`);
        resolve();
      };

      link.onerror = () => {
        console.error(`❌ Failed to load CSS: ${href}`);
        reject(new Error(`Failed to load CSS: ${href}`));
      };

      document.head.appendChild(link);
    });
  }

  /**
   * 更新平均載入時間
   */
  private updateAverageLoadTime(): void {
    const times = Array.from(this.loadTimes.values());
    this.stats.averageLoadTime =
      times.reduce((a, b) => a + b, 0) / times.length;
  }

  /**
   * 獲取載入統計
   */
  getStats(): ProgressiveLoadingStats {
    return {
      ...this.stats,
      cacheHitRate:
        (this.imageCache.size / Math.max(this.stats.totalImages, 1)) * 100,
    };
  }

  /**
   * 重置統計
   */
  resetStats(): void {
    this.stats = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      averageLoadTime: 0,
      cacheHitRate: 0,
    };
    this.loadTimes.clear();
    this.failedUrls.clear();
  }

  /**
   * 清理資源
   */
  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.loadingImages.clear();
    this.imageCache.clear();
    this.loadTimes.clear();
    this.failedUrls.clear();

    console.log("🧹 Progressive Loading Manager cleaned up");
  }

  /**
   * 獲取快取狀態
   */
  getCacheStatus() {
    return {
      cacheSize: this.imageCache.size,
      loadingCount: this.loadingImages.size,
      failedCount: this.failedUrls.size,
    };
  }
}

// 單例模式
export const progressiveLoadingManager = new ProgressiveLoadingManager();

// Vue 3 組合式函數
import { ref } from "vue";

export function useProgressiveLoading() {
  const stats = ref<ProgressiveLoadingStats>({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    cacheHitRate: 0,
  });

  const updateStats = () => {
    stats.value = progressiveLoadingManager.getStats();
  };

  // 懶加載指令
  const vLazyLoad = {
    mounted(el: HTMLImageElement, binding: any) {
      progressiveLoadingManager.lazyLoadImage(el, binding.value);
    },
  };

  return {
    stats,
    updateStats,
    vLazyLoad,
    preloadImages: progressiveLoadingManager.preloadImages.bind(
      progressiveLoadingManager
    ),
    preloadResource: progressiveLoadingManager.preloadResource.bind(
      progressiveLoadingManager
    ),
    loadModule: progressiveLoadingManager.loadModule.bind(
      progressiveLoadingManager
    ),
    loadCSS: progressiveLoadingManager.loadCSS.bind(progressiveLoadingManager),
  };
}

export default progressiveLoadingManager;
