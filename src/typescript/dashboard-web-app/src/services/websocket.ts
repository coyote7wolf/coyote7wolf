// Mock WebSocket 服務 - 模擬即時數據推送
import { ref, readonly } from "vue";
import type {
  DashboardMetrics,
  CollaborationStats,
  AIInsights,
  PerformanceMetrics,
  RealtimeUpdate,
} from "@/stores/types";

export interface WebSocketService {
  connect(): Promise<void>;
  disconnect(): void;
  subscribe(event: string, callback: (data: any) => void): void;
  unsubscribe(event: string, callback: (data: any) => void): void;
  isConnected(): boolean;
}

export class MockWebSocketService implements WebSocketService {
  private connected = false;
  private listeners = new Map<string, Set<(data: any) => void>>();
  private intervals = new Map<string, NodeJS.Timeout>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async connect(): Promise<void> {
    console.log("🔌 MockWebSocket: 嘗試連接...");

    return new Promise((resolve, reject) => {
      setTimeout(
        () => {
          if (Math.random() > 0.1) {
            // 90% 成功率
            this.connected = true;
            this.reconnectAttempts = 0;
            console.log("🔌 MockWebSocket: 連接成功");
            this.startDataStreams();
            resolve();
          } else {
            console.log("🔌 MockWebSocket: 連接失敗");
            this.handleReconnect();
            reject(new Error("Connection failed"));
          }
        },
        500 + Math.random() * 1000
      ); // 0.5-1.5秒連接時間
    });
  }

  disconnect(): void {
    console.log("🔌 MockWebSocket: 斷開連接");
    this.connected = false;
    this.stopDataStreams();
  }

  subscribe(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    console.log(`🔌 MockWebSocket: 訂閱事件 ${event}`);
  }

  unsubscribe(event: string, callback: (data: any) => void): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
      if (this.listeners.get(event)!.size === 0) {
        this.listeners.delete(event);
      }
    }
    console.log(`🔌 MockWebSocket: 取消訂閱事件 ${event}`);
  }

  isConnected(): boolean {
    return this.connected;
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔌 MockWebSocket: 重連嘗試 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );

      setTimeout(() => {
        this.connect().catch(() => {
          this.handleReconnect();
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log("🔌 MockWebSocket: 重連失敗，達到最大嘗試次數");
      this.emit("connection_failed", {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
      });
    }
  }

  private startDataStreams(): void {
    // Dashboard metrics 更新 (每5秒)
    this.intervals.set(
      "dashboard",
      setInterval(() => {
        if (this.connected) {
          this.emit("dashboard:metrics", this.generateDashboardUpdate());
        }
      }, 5000)
    );

    // Collaboration stats 更新 (每3秒)
    this.intervals.set(
      "collaboration",
      setInterval(() => {
        if (this.connected) {
          this.emit("collaboration:stats", this.generateCollaborationUpdate());
        }
      }, 3000)
    );

    // AI insights 更新 (每10秒)
    this.intervals.set(
      "ai",
      setInterval(() => {
        if (this.connected) {
          this.emit("ai:insights", this.generateAIUpdate());
        }
      }, 10000)
    );

    // Performance metrics 更新 (每2秒)
    this.intervals.set(
      "performance",
      setInterval(() => {
        if (this.connected) {
          this.emit("performance:metrics", this.generatePerformanceUpdate());
        }
      }, 2000)
    );

    // 用戶活動更新 (每1秒)
    this.intervals.set(
      "users",
      setInterval(() => {
        if (this.connected) {
          this.emit("users:activity", this.generateUserActivity());
        }
      }, 1000)
    );
  }

  private stopDataStreams(): void {
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals.clear();
  }

  private emit(event: string, data: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((callback) => {
        callback(data);
      });
    }
  }

  private generateDashboardUpdate(): RealtimeUpdate<DashboardMetrics> {
    const now = new Date();
    return {
      timestamp: now.toISOString(),
      event: "dashboard:metrics",
      data: {
        activeUsers: Math.floor(Math.random() * 50) + 20,
        systemHealth: Math.random() > 0.9 ? "warning" : "healthy",
        totalCollaborations: Math.floor(Math.random() * 1000) + 5000,
        successfulSyncs: Math.floor(Math.random() * 100) + 900,
        pendingConflicts: Math.floor(Math.random() * 10),
        averageResponseTime: Math.floor(Math.random() * 50) + 120,
        dataTransferred: Math.floor(Math.random() * 1000) + 10000,
        cpuUsage: Math.random() * 0.8 + 0.1,
        memoryUsage: Math.random() * 0.7 + 0.2,
        uptime: Math.floor(
          (Date.now() - new Date("2024-01-01").getTime()) / 1000
        ),
      },
    };
  }

  private generateCollaborationUpdate(): RealtimeUpdate<CollaborationStats> {
    return {
      timestamp: new Date().toISOString(),
      event: "collaboration:stats",
      data: {
        activeCollaborations: Math.floor(Math.random() * 25) + 10,
        recentConflicts: Math.floor(Math.random() * 5),
        resolvedConflicts: Math.floor(Math.random() * 20) + 100,
        averageResolutionTime: Math.floor(Math.random() * 300) + 60,
        topCollaborators: [
          { name: "Alice Chen", edits: Math.floor(Math.random() * 50) + 20 },
          { name: "Bob Wang", edits: Math.floor(Math.random() * 40) + 15 },
          { name: "Carol Liu", edits: Math.floor(Math.random() * 35) + 10 },
        ],
        hotspots: this.generateHotspots(),
      },
    };
  }

  private generateAIUpdate(): RealtimeUpdate<AIInsights> {
    return {
      timestamp: new Date().toISOString(),
      event: "ai:insights",
      data: {
        totalRequests: Math.floor(Math.random() * 1000) + 5000,
        successRate: 0.95 + Math.random() * 0.04,
        averageResponseTime: Math.floor(Math.random() * 200) + 300,
        tokensUsed: Math.floor(Math.random() * 10000) + 50000,
        costToday: Math.random() * 50 + 25,
        topModels: [
          { name: "GPT-4", usage: Math.random() * 0.4 + 0.3 },
          { name: "Claude-3", usage: Math.random() * 0.3 + 0.2 },
          { name: "Gemini-Pro", usage: Math.random() * 0.2 + 0.1 },
        ],
        suggestionAcceptRate: Math.random() * 0.2 + 0.7,
      },
    };
  }

  private generatePerformanceUpdate(): RealtimeUpdate<PerformanceMetrics> {
    return {
      timestamp: new Date().toISOString(),
      event: "performance:metrics",
      data: {
        cpu: Math.random() * 0.8 + 0.1,
        memory: Math.random() * 0.7 + 0.2,
        disk: Math.random() * 0.6 + 0.3,
        network: {
          incoming: Math.floor(Math.random() * 1000) + 500,
          outgoing: Math.floor(Math.random() * 800) + 300,
        },
        responseTime: Math.floor(Math.random() * 100) + 50,
        throughput: Math.floor(Math.random() * 500) + 1000,
        errorRate: Math.random() * 0.05,
        activeConnections: Math.floor(Math.random() * 100) + 200,
      },
    };
  }

  private generateUserActivity() {
    const activities = [
      "user_joined",
      "user_left",
      "document_edited",
      "conflict_resolved",
      "sync_completed",
      "ai_suggestion_accepted",
    ];

    return {
      timestamp: new Date().toISOString(),
      event: "users:activity",
      data: {
        type: activities[Math.floor(Math.random() * activities.length)],
        user: `User${Math.floor(Math.random() * 50) + 1}`,
        document: `doc_${Math.floor(Math.random() * 20) + 1}`,
        details: `Activity at ${new Date().toLocaleTimeString()}`,
      },
    };
  }

  private generateHotspots() {
    const documents = [
      "project-spec.md",
      "api-docs.json",
      "readme.md",
      "config.yaml",
    ];
    return documents.map((doc) => ({
      document: doc,
      editCount: Math.floor(Math.random() * 20) + 5,
      lastEdit: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    }));
  }
}

// 全域 WebSocket 服務實例
export const mockWebSocketService = new MockWebSocketService();

// WebSocket 連接狀態管理
export const useWebSocketConnection = () => {
  const connected = ref(false);
  const connecting = ref(false);
  const error = ref<string | null>(null);
  const reconnectAttempts = ref(0);

  const connect = async () => {
    if (connecting.value || connected.value) return;

    connecting.value = true;
    error.value = null;

    try {
      await mockWebSocketService.connect();
      connected.value = true;
      console.log("📡 WebSocket 連接成功");
    } catch (err: any) {
      error.value = err.message;
      console.error("📡 WebSocket 連接失敗:", err);
    } finally {
      connecting.value = false;
    }
  };

  const disconnect = () => {
    mockWebSocketService.disconnect();
    connected.value = false;
    console.log("📡 WebSocket 已斷開");
  };

  // 自動重連邏輯
  const autoReconnect = () => {
    if (!connected.value && reconnectAttempts.value < 5) {
      reconnectAttempts.value++;
      console.log(`📡 自動重連嘗試 ${reconnectAttempts.value}`);
      setTimeout(connect, 2000 * reconnectAttempts.value);
    }
  };

  // 監聽連接失敗事件
  mockWebSocketService.subscribe("connection_failed", () => {
    connected.value = false;
    error.value = "Connection failed after multiple attempts";
  });

  return {
    connected: readonly(connected),
    connecting: readonly(connecting),
    error: readonly(error),
    reconnectAttempts: readonly(reconnectAttempts),
    connect,
    disconnect,
    autoReconnect,
  };
};
