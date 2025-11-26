// 豐富的 Mock 數據生成器 - 7天歷史數據 + 峰值/低谷模擬 + 異常事件
import type {
  HeatmapPoint,
  ConflictStats,
  LLMUsage,
  ActiveUser,
  ServiceStatus,
  WebSocketMetrics,
  RedisMetrics,
} from "@/stores/types";

// 時間工具
export const timeUtils = {
  // 獲取過去 N 天的日期數組
  getPastDays(days: number): string[] {
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  },

  // 獲取今天的小時數組
  getTodayHours(): string[] {
    const hours: string[] = [];
    for (let i = 0; i < 24; i++) {
      hours.push(`${i.toString().padStart(2, "0")}:00`);
    }
    return hours;
  },

  // 生成工作時間權重（9-18點較高）
  getWorkingHourWeight(hour: number): number {
    if (hour >= 9 && hour <= 18) {
      return 0.8 + Math.random() * 0.4; // 0.8-1.2
    } else if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 22)) {
      return 0.3 + Math.random() * 0.4; // 0.3-0.7
    } else {
      return 0.1 + Math.random() * 0.2; // 0.1-0.3
    }
  },

  // 生成週末權重（週末較低）
  getWeekendWeight(date: string): number {
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // 週日或週六
      return 0.2 + Math.random() * 0.3; // 0.2-0.5
    }
    return 0.7 + Math.random() * 0.6; // 0.7-1.3
  },
};

// 用戶數據生成器
export const userGenerator = {
  // 生成真實的用戶名稱
  generateUserNames(count: number): string[] {
    const firstNames = [
      "Alice",
      "Bob",
      "Carol",
      "David",
      "Emma",
      "Frank",
      "Grace",
      "Henry",
      "Ivy",
      "Jack",
      "Kelly",
      "Liam",
      "Mary",
      "Noah",
      "Olivia",
      "Peter",
      "Quinn",
      "Rose",
      "Sam",
      "Tina",
      "Uma",
      "Victor",
      "Wendy",
      "Xavier",
      "Yara",
      "Zoe",
      "小明",
      "小紅",
      "小華",
      "小美",
      "小強",
      "小芳",
      "志明",
      "春嬌",
      "建華",
      "美玲",
      "俊傑",
      "雅婷",
      "子軒",
      "怡君",
    ];

    const lastNames = [
      "Chen",
      "Wang",
      "Liu",
      "Zhang",
      "Li",
      "Yang",
      "Huang",
      "Zhao",
      "Wu",
      "Zhou",
      "Xu",
      "Sun",
      "Ma",
      "Zhu",
      "Hu",
      "Guo",
      "He",
      "Lin",
    ];

    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      names.push(`${firstName} ${lastName}`);
    }
    return names;
  },

  // 生成活躍用戶
  generateActiveUsers(count: number): ActiveUser[] {
    const names = this.generateUserNames(count);
    const statuses: ("editing" | "viewing" | "commenting" | "idle")[] = [
      "editing",
      "viewing",
      "commenting",
      "idle",
    ];
    const files = [
      "project-spec.md",
      "api-documentation.json",
      "README.md",
      "config.yaml",
      "user-guide.md",
      "deployment.yaml",
      "database-schema.sql",
      "test-plan.md",
      "architecture.md",
      "changelog.md",
    ];

    return names.map((name, index) => ({
      id: `user_${index + 1}`,
      name,
      avatar: `/avatars/user${(index % 10) + 1}.jpg`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      currentFile: files[Math.floor(Math.random() * files.length)],
      lastActivity: new Date(
        Date.now() - Math.random() * 3600000
      ).toISOString(),
      cursor: {
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 800),
      },
    }));
  },
};

// 協作數據生成器
export const collaborationGenerator = {
  // 生成協作熱力圖數據（50用戶，7天）
  generateHeatmapData(
    userCount: number = 50,
    days: number = 7
  ): HeatmapPoint[] {
    const dates = timeUtils.getPastDays(days);
    const users = userGenerator.generateUserNames(userCount);
    const files = [
      "project-spec.md",
      "api-docs.json",
      "readme.md",
      "config.yaml",
      "user-guide.md",
      "deployment.md",
      "architecture.md",
      "changelog.md",
      "test-plan.md",
      "database-schema.sql",
      "frontend-design.md",
      "backend-api.md",
    ];

    const heatmapPoints: HeatmapPoint[] = [];

    dates.forEach((date) => {
      const weekendWeight = timeUtils.getWeekendWeight(date);

      users.forEach((userName, userIndex) => {
        files.forEach((fileName, fileIndex) => {
          // 每個用戶每天對每個文件都有可能進行編輯
          if (Math.random() < 0.3 * weekendWeight) {
            // 30% 基礎概率 * 週末權重
            const editCount =
              Math.floor(Math.random() * 20 * weekendWeight) + 1;

            heatmapPoints.push({
              userId: `user_${userIndex + 1}`,
              userName,
              fileId: `file_${fileIndex + 1}`,
              fileName,
              editCount,
              timestamp: date,
              x: Math.floor(Math.random() * 1000),
              y: Math.floor(Math.random() * 800),
              intensity: Math.min(editCount / 20, 1), // 正規化到 0-1
            });
          }
        });
      });
    });

    return heatmapPoints;
  },

  // 生成衝突統計數據
  generateConflictStats(): ConflictStats {
    const total = Math.floor(Math.random() * 100) + 200;
    const resolved = Math.floor(total * (0.85 + Math.random() * 0.1)); // 85%-95% 解決率
    const pending = total - resolved;
    const autoResolved = Math.floor(resolved * (0.7 + Math.random() * 0.2)); // 70%-90% 自動解決
    const manualResolved = resolved - autoResolved;

    return {
      total,
      resolved,
      pending,
      autoResolved,
      manualResolved,
      types: {
        textConflict: Math.floor(total * (0.4 + Math.random() * 0.2)), // 40%-60%
        formatConflict: Math.floor(total * (0.2 + Math.random() * 0.15)), // 20%-35%
        structuralConflict: Math.floor(total * (0.1 + Math.random() * 0.1)), // 10%-20%
      },
      resolutionTimes: {
        average: Math.floor(Math.random() * 300) + 60, // 60-360秒
        median: Math.floor(Math.random() * 180) + 45, // 45-225秒
        p95: Math.floor(Math.random() * 600) + 300, // 300-900秒
      },
    };
  },
};

// AI 數據生成器
export const aiGenerator = {
  // 生成 LLM 使用統計
  generateLLMUsage(days: number = 7): LLMUsage {
    const dates = timeUtils.getPastDays(days);
    const models = [
      { name: "GPT-4", baseUsage: 0.4, baseCost: 0.06 },
      { name: "Claude-3", baseUsage: 0.3, baseCost: 0.045 },
      { name: "Gemini-Pro", baseUsage: 0.2, baseCost: 0.03 },
      { name: "GPT-3.5", baseUsage: 0.1, baseCost: 0.002 },
    ];

    const dailyUsage = dates.map((date) => {
      const weekendWeight = timeUtils.getWeekendWeight(date);
      const tokens = Math.floor(
        (Math.random() * 50000 + 30000) * weekendWeight
      );
      const requests = Math.floor((Math.random() * 500 + 300) * weekendWeight);

      return {
        date,
        tokens,
        requests,
      };
    });

    const totalTokens = dailyUsage.reduce((sum, day) => sum + day.tokens, 0);
    const totalRequests = dailyUsage.reduce(
      (sum, day) => sum + day.requests,
      0
    );

    const topModels = models
      .map((model) => ({
        name: model.name,
        usage: model.baseUsage + (Math.random() - 0.5) * 0.1, // ±5% 變動
        cost:
          (totalTokens *
            model.baseCost *
            (model.baseUsage + (Math.random() - 0.5) * 0.1)) /
          1000,
      }))
      .sort((a, b) => b.usage - a.usage);

    return {
      totalTokens,
      costThisMonth: topModels.reduce((sum, model) => sum + model.cost, 0),
      avgTokensPerRequest: Math.floor(totalTokens / totalRequests),
      topModels,
      suggestionAcceptRate: 0.65 + Math.random() * 0.25, // 65%-90%
      dailyUsage,
    };
  },
};

// 系統效能數據生成器
export const performanceGenerator = {
  // 生成 WebSocket 指標
  generateWebSocketMetrics(): WebSocketMetrics {
    return {
      connections: Math.floor(Math.random() * 500) + 200,
      averageLatency: Math.floor(Math.random() * 50) + 20, // 20-70ms
      uptime: Math.random() * 0.05 + 0.95, // 95%-100%
      messagesPerSecond: Math.floor(Math.random() * 1000) + 500,
      errorRate: Math.random() * 0.02, // 0%-2%
    };
  },

  // 生成 Redis 指標
  generateRedisMetrics(): RedisMetrics {
    return {
      hitRate: Math.random() * 0.15 + 0.85, // 85%-100%
      memoryUsage: Math.random() * 0.3 + 0.4, // 40%-70%
      keyCount: Math.floor(Math.random() * 100000) + 50000,
      expiredKeys: Math.floor(Math.random() * 1000) + 100,
      evictedKeys: Math.floor(Math.random() * 50),
    };
  },

  // 生成服務狀態
  generateServiceStatuses(): ServiceStatus[] {
    const services = [
      "Auth Service",
      "User Service",
      "Document Service",
      "AI Agent Service",
      "Collaboration Service",
      "Notification Service",
      "Gateway Service",
      "Memory Service",
      "Sync Service",
      "Audit Service",
    ];

    return services.map((name) => {
      const isHealthy = Math.random() > 0.1; // 90% 健康率
      const status = isHealthy
        ? "healthy"
        : Math.random() > 0.5
          ? "warning"
          : "error";

      return {
        name,
        status: status as "healthy" | "warning" | "error",
        responseTime:
          Math.floor(Math.random() * (status === "healthy" ? 100 : 500)) + 50,
        uptime:
          status === "healthy"
            ? Math.random() * 0.05 + 0.95 // 95%-100%
            : Math.random() * 0.2 + 0.7, // 70%-90%
        requestsPerMinute: Math.floor(Math.random() * 1000) + 100,
      };
    });
  },
};

// 異常事件生成器
export const anomalyGenerator = {
  // 生成系統異常事件
  generateAnomalies(days: number = 7) {
    const dates = timeUtils.getPastDays(days);
    const anomalyTypes = [
      "High CPU Usage",
      "Memory Leak",
      "Database Timeout",
      "API Rate Limit",
      "WebSocket Disconnection",
      "Sync Failure",
      "Authentication Error",
    ];

    const anomalies: Array<{
      timestamp: string;
      type: string;
      severity: "low" | "medium" | "high";
      description: string;
      resolved: boolean;
      resolutionTime?: number;
    }> = [];

    dates.forEach((date) => {
      // 每天有 10%-30% 概率發生異常
      const anomalyCount =
        Math.random() < 0.2 ? Math.floor(Math.random() * 3) + 1 : 0;

      for (let i = 0; i < anomalyCount; i++) {
        const type =
          anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
        const severity =
          Math.random() < 0.1 ? "high" : Math.random() < 0.3 ? "medium" : "low";
        const resolved = Math.random() > 0.2; // 80% 已解決

        anomalies.push({
          timestamp: new Date(
            `${date}T${Math.floor(Math.random() * 24)
              .toString()
              .padStart(2, "0")}:${Math.floor(Math.random() * 60)
              .toString()
              .padStart(2, "0")}:00`
          ).toISOString(),
          type,
          severity,
          description: `${type} detected in system monitoring`,
          resolved,
          resolutionTime: resolved
            ? Math.floor(Math.random() * 3600) + 300
            : undefined, // 5分鐘到1小時
        });
      }
    });

    return anomalies.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },
};

// 主要的豐富數據生成器
export const richMockDataGenerator = {
  // 生成完整的 Mock 數據集
  generateCompleteDataset() {
    console.log("🎭 生成豐富的 Mock 數據集...");

    return {
      // 協作數據
      collaboration: {
        heatmapData: collaborationGenerator.generateHeatmapData(50, 7),
        conflictStats: collaborationGenerator.generateConflictStats(),
        activeUsers: userGenerator.generateActiveUsers(15),
        recentActivity: this.generateRecentActivity(),
      },

      // AI 數據
      ai: {
        llmUsage: aiGenerator.generateLLMUsage(7),
        contextFlow: this.generateContextFlow(),
        teamRecommendations: this.generateTeamRecommendations(),
      },

      // 效能數據
      performance: {
        websocketMetrics: performanceGenerator.generateWebSocketMetrics(),
        redisMetrics: performanceGenerator.generateRedisMetrics(),
        serviceStatuses: performanceGenerator.generateServiceStatuses(),
        systemHealth: this.generateSystemHealth(),
      },

      // 異常數據
      anomalies: anomalyGenerator.generateAnomalies(7),

      // 歷史趨勢數據
      trends: this.generateTrendData(7),
    };
  },

  // 生成最近活動
  generateRecentActivity() {
    const activities = [
      "Document edited",
      "Conflict resolved",
      "User joined",
      "Sync completed",
      "AI suggestion accepted",
      "Comment added",
      "File uploaded",
      "Branch merged",
    ];

    return Array.from({ length: 20 }, (_, index) => ({
      id: `activity_${index + 1}`,
      type: activities[Math.floor(Math.random() * activities.length)],
      user: userGenerator.generateUserNames(1)[0],
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(), // 過去24小時
      details: `Activity performed at ${new Date().toLocaleTimeString()}`,
    }));
  },

  // 生成 Context Flow 數據
  generateContextFlow() {
    // 簡化版本，完整版本需要 Three.js
    const nodes = Array.from({ length: 20 }, (_, index) => ({
      id: `node_${index + 1}`,
      type: ["document", "code", "discussion", "task", "decision"][
        Math.floor(Math.random() * 5)
      ] as any,
      label: `Node ${index + 1}`,
      connections: Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        () => `node_${Math.floor(Math.random() * 20) + 1}`
      ),
      semanticScore: Math.random(),
      position: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        z: Math.random() * 1000,
      },
    }));

    return { nodes };
  },

  // 生成團隊建議
  generateTeamRecommendations() {
    const recommendations = [
      {
        type: "collaboration",
        title: "最佳協作時段建議",
        description: "根據分析，團隊在下午2-4點協作效率最高",
        confidence: 0.85,
        actionable: true,
      },
      {
        type: "conflict",
        title: "衝突預防建議",
        description: "建議在 project-spec.md 文件上增加鎖定機制",
        confidence: 0.92,
        actionable: true,
      },
      {
        type: "ai",
        title: "AI 使用優化",
        description: "Claude-3 在代碼生成任務上表現更佳",
        confidence: 0.78,
        actionable: true,
      },
    ];

    return recommendations;
  },

  // 生成系統健康數據
  generateSystemHealth() {
    const overall = Math.random();
    return {
      overall: overall > 0.8 ? "healthy" : overall > 0.6 ? "warning" : "error",
      cpu: Math.random() * 0.8 + 0.1,
      memory: Math.random() * 0.7 + 0.2,
      disk: Math.random() * 0.6 + 0.3,
      network: Math.random() * 0.5 + 0.1,
    };
  },

  // 生成趨勢數據
  generateTrendData(days: number) {
    const dates = timeUtils.getPastDays(days);

    return {
      userActivity: dates.map((date) => ({
        date,
        activeUsers:
          Math.floor(Math.random() * 100 + 50) *
          timeUtils.getWeekendWeight(date),
        collaborations:
          Math.floor(Math.random() * 200 + 100) *
          timeUtils.getWeekendWeight(date),
        conflicts:
          Math.floor(Math.random() * 50 + 10) *
          timeUtils.getWeekendWeight(date),
      })),

      systemPerformance: dates.map((date) => ({
        date,
        responseTime: Math.floor(Math.random() * 100 + 80),
        throughput:
          Math.floor(Math.random() * 5000 + 3000) *
          timeUtils.getWeekendWeight(date),
        errorRate: Math.random() * 0.05,
      })),

      aiUsage: dates.map((date) => ({
        date,
        requests:
          Math.floor(Math.random() * 1000 + 500) *
          timeUtils.getWeekendWeight(date),
        tokens:
          Math.floor(Math.random() * 50000 + 30000) *
          timeUtils.getWeekendWeight(date),
        cost: Math.random() * 100 + 50,
      })),
    };
  },
};
