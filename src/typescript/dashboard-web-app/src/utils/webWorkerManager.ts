/**
 * Web Worker 管理器 - Phase 5 高性能大數據處理
 * 提供數據處理、過濾、排序、搜尋等功能的 Web Worker 管理
 */

export interface WorkerMessage {
  type: string;
  data: any;
  requestId: string;
}

export interface WorkerResponse {
  type: string;
  data?: any;
  error?: string;
  requestId: string;
}

export interface FilterOptions {
  searchQuery?: string;
  selectedTypes?: string[];
  selectedDepartments?: string[];
  activeOnly?: boolean;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

export interface SortOptions {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface DataItem {
  id: string;
  name: string;
  email: string;
  department: string;
  type: string;
  joinDate: Date | string;
  lastActive: Date | string;
  isActive: boolean;
  color: string;
  searchScore?: number;
}

export interface Statistics {
  total: number;
  active: number;
  inactive: number;
  departments: Record<string, number>;
  types: Record<string, number>;
  recentActivity: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  joinDateStats: {
    thisYear: number;
    lastYear: number;
    older: number;
  };
}

class WebWorkerManager {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (error: any) => void;
      type: string;
      startTime: number;
    }
  >();
  private requestIdCounter = 0;
  private isInitialized = false;
  private performance = {
    totalRequests: 0,
    completedRequests: 0,
    totalProcessingTime: 0,
    averageProcessingTime: 0,
    errors: 0,
  };

  constructor() {
    this.initializeWorker();
  }

  /**
   * 初始化 Web Worker
   */
  private initializeWorker(): void {
    try {
      // 檢查 Web Worker 支持
      if (typeof Worker === "undefined") {
        console.warn("Web Workers not supported in this environment");
        return;
      }

      this.worker = new Worker("/dataProcessingWorker.js");
      this.setupWorkerEventListeners();
      this.isInitialized = true;

      console.log("✅ Web Worker initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Web Worker:", error);
      this.isInitialized = false;
    }
  }

  /**
   * 設置 Worker 事件監聽器
   */
  private setupWorkerEventListeners(): void {
    if (!this.worker) return;

    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, data, error, requestId } = event.data;

      const request = this.pendingRequests.get(requestId);
      if (!request) {
        console.warn(`Received response for unknown request: ${requestId}`);
        return;
      }

      const processingTime = performance.now() - request.startTime;
      this.updatePerformanceStats(processingTime, !error);

      if (error) {
        console.error(`Worker error for ${request.type}:`, error);
        request.reject(new Error(error));
      } else {
        request.resolve(data);
      }

      this.pendingRequests.delete(requestId);
    };

    this.worker.onerror = (error) => {
      console.error("Worker error:", error);
      this.performance.errors++;

      // 重新初始化 Worker
      this.terminateWorker();
      setTimeout(() => this.initializeWorker(), 1000);
    };

    this.worker.onmessageerror = (error) => {
      console.error("Worker message error:", error);
      this.performance.errors++;
    };
  }

  /**
   * 更新性能統計
   */
  private updatePerformanceStats(
    processingTime: number,
    success: boolean
  ): void {
    this.performance.completedRequests++;
    this.performance.totalProcessingTime += processingTime;
    this.performance.averageProcessingTime =
      this.performance.totalProcessingTime / this.performance.completedRequests;

    if (!success) {
      this.performance.errors++;
    }
  }

  /**
   * 發送消息到 Worker
   */
  private sendMessage<T>(type: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized || !this.worker) {
        reject(new Error("Web Worker not initialized"));
        return;
      }

      const requestId = `req_${Date.now()}_${++this.requestIdCounter}`;

      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        type,
        startTime: performance.now(),
      });

      this.performance.totalRequests++;

      const message: WorkerMessage = {
        type,
        data,
        requestId,
      };

      this.worker.postMessage(message);

      // 設置超時
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Request timeout for ${type}`));
        }
      }, 30000); // 30 秒超時
    });
  }

  /**
   * 過濾數據
   */
  async filterData(
    items: DataItem[],
    filters: FilterOptions
  ): Promise<{
    filteredItems: DataItem[];
    originalCount: number;
    filteredCount: number;
    processingTime: number;
  }> {
    try {
      return await this.sendMessage("FILTER_DATA", { items, filters });
    } catch (error) {
      console.error("Filter data error:", error);
      // 回退到主線程處理
      return this.fallbackFilterData(items, filters);
    }
  }

  /**
   * 排序數據
   */
  async sortData(
    items: DataItem[],
    sortBy: string,
    sortOrder: "asc" | "desc" = "asc"
  ): Promise<{
    sortedItems: DataItem[];
    processingTime: number;
  }> {
    try {
      return await this.sendMessage("SORT_DATA", { items, sortBy, sortOrder });
    } catch (error) {
      console.error("Sort data error:", error);
      // 回退到主線程處理
      return this.fallbackSortData(items, sortBy, sortOrder);
    }
  }

  /**
   * 搜尋數據
   */
  async searchData(
    items: DataItem[],
    query: string
  ): Promise<{
    results: DataItem[];
    totalMatches: number;
    processingTime: number;
  }> {
    try {
      return await this.sendMessage("SEARCH_DATA", { items, query });
    } catch (error) {
      console.error("Search data error:", error);
      // 回退到主線程處理
      return this.fallbackSearchData(items, query);
    }
  }

  /**
   * 生成數據
   */
  async generateData(
    count: number,
    startIndex: number = 0
  ): Promise<{
    items: DataItem[];
    count: number;
    processingTime: number;
  }> {
    try {
      return await this.sendMessage("GENERATE_DATA", { count, startIndex });
    } catch (error) {
      console.error("Generate data error:", error);
      throw error;
    }
  }

  /**
   * 計算統計數據
   */
  async calculateStatistics(items: DataItem[]): Promise<{
    statistics: Statistics;
    processingTime: number;
  }> {
    try {
      return await this.sendMessage("CALCULATE_STATISTICS", { items });
    } catch (error) {
      console.error("Calculate statistics error:", error);
      // 回退到主線程處理
      return this.fallbackCalculateStatistics(items);
    }
  }

  /**
   * 獲取性能統計
   */
  getPerformanceStats() {
    return {
      ...this.performance,
      pendingRequests: this.pendingRequests.size,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * 清理並終止 Worker
   */
  terminateWorker(): void {
    if (this.worker) {
      // 拒絕所有待處理的請求
      this.pendingRequests.forEach((request) => {
        request.reject(new Error("Worker terminated"));
      });
      this.pendingRequests.clear();

      this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;

      console.log("🔄 Web Worker terminated");
    }
  }

  /**
   * 重新初始化 Worker
   */
  reinitialize(): void {
    this.terminateWorker();
    setTimeout(() => this.initializeWorker(), 100);
  }

  // 回退方法 - 當 Web Worker 不可用時在主線程執行

  private fallbackFilterData(items: DataItem[], filters: FilterOptions) {
    const startTime = performance.now();

    let filteredItems = items;

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query) ||
          item.department.toLowerCase().includes(query)
      );
    }

    if (filters.selectedTypes && filters.selectedTypes.length > 0) {
      filteredItems = filteredItems.filter((item) =>
        filters.selectedTypes!.includes(item.type)
      );
    }

    const processingTime = performance.now() - startTime;

    return {
      filteredItems,
      originalCount: items.length,
      filteredCount: filteredItems.length,
      processingTime,
    };
  }

  private fallbackSortData(
    items: DataItem[],
    sortBy: string,
    sortOrder: "asc" | "desc"
  ) {
    const startTime = performance.now();

    const sortedItems = [...items].sort((a, b) => {
      let aValue = (a as any)[sortBy];
      let bValue = (b as any)[sortBy];

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      const result = String(aValue).localeCompare(String(bValue));
      return sortOrder === "asc" ? result : -result;
    });

    const processingTime = performance.now() - startTime;

    return {
      sortedItems,
      processingTime,
    };
  }

  private fallbackSearchData(items: DataItem[], query: string) {
    const startTime = performance.now();

    if (!query || query.trim() === "") {
      return {
        results: items,
        totalMatches: items.length,
        processingTime: 0,
      };
    }

    const results = items.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.email.toLowerCase().includes(query.toLowerCase()) ||
        item.department.toLowerCase().includes(query.toLowerCase())
    );

    const processingTime = performance.now() - startTime;

    return {
      results,
      totalMatches: results.length,
      processingTime,
    };
  }

  private fallbackCalculateStatistics(items: DataItem[]) {
    const startTime = performance.now();

    const stats: Statistics = {
      total: items.length,
      active: 0,
      inactive: 0,
      departments: {},
      types: {},
      recentActivity: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
      },
      joinDateStats: {
        thisYear: 0,
        lastYear: 0,
        older: 0,
      },
    };

    items.forEach((item) => {
      if (item.isActive) {
        stats.active++;
      } else {
        stats.inactive++;
      }

      stats.departments[item.department] =
        (stats.departments[item.department] || 0) + 1;
      stats.types[item.type] = (stats.types[item.type] || 0) + 1;
    });

    const processingTime = performance.now() - startTime;

    return {
      statistics: stats,
      processingTime,
    };
  }
}

// 單例模式
export const webWorkerManager = new WebWorkerManager();

// 清理函數，在應用卸載時調用
export const cleanupWebWorker = () => {
  webWorkerManager.terminateWorker();
};

export default webWorkerManager;
