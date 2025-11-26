import { mockData } from "../browser";

// Generate rich collaboration heatmap data
export function generateHeatmapData(userCount: number, days: number) {
  const data = [];
  const files = [
    "產品規劃.md",
    "技術架構.md",
    "API文件.md",
    "使用者手冊.md",
    "測試計畫.md",
  ];

  for (let day = 0; day < days; day++) {
    for (let user = 0; user < userCount; user++) {
      const fileIndex = Math.floor(Math.random() * files.length);
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - day);
      timestamp.setHours(9 + Math.floor(Math.random() * 8)); // 9am-5pm

      data.push({
        userId: `user-${String(user + 1).padStart(3, "0")}`,
        userName: `User ${user + 1}`,
        fileId: `doc-${String(fileIndex + 1).padStart(3, "0")}`,
        fileName: files[fileIndex],
        editCount: Math.floor(Math.random() * 50) + 5,
        timestamp: timestamp.toISOString(),
        x: Math.floor(Math.random() * 400) + 50,
        y: Math.floor(Math.random() * 300) + 50,
        intensity: Math.random() * 0.8 + 0.2,
      });
    }
  }

  return data;
}

// Generate active users with realistic data
export function generateActiveUsers(count: number) {
  const names = [
    "Alice Chen",
    "Bob Wang",
    "Carol Liu",
    "David Zhang",
    "Eva Lin",
    "Frank Wu",
    "Grace Huang",
    "Henry Chang",
    "Iris Kao",
    "Jack Lee",
  ];

  const statuses = ["editing", "viewing", "commenting", "idle"];
  const files = [
    "產品規劃.md",
    "技術架構.md",
    "API文件.md",
    "使用者手冊.md",
    "測試計畫.md",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `user-${String(i + 1).padStart(3, "0")}`,
    name: names[i % names.length],
    avatar: `/avatars/user-${i + 1}.jpg`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    currentFile: files[Math.floor(Math.random() * files.length)],
    lastActivity: new Date(Date.now() - Math.random() * 300000).toISOString(), // within 5 minutes
    cursor: {
      x: Math.floor(Math.random() * 400) + 50,
      y: Math.floor(Math.random() * 300) + 50,
    },
  }));
}

// Generate 3D context flow data
export function generate3DContextFlow() {
  const nodeTypes = ["document", "code", "discussion", "task", "decision"];
  const nodes = [];

  for (let i = 0; i < 20; i++) {
    nodes.push({
      id: `context-${String(i + 1).padStart(3, "0")}`,
      type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
      label: `Node ${i + 1}`,
      connections: Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        () =>
          `context-${String(Math.floor(Math.random() * 20) + 1).padStart(3, "0")}`
      ).filter((id) => id !== `context-${String(i + 1).padStart(3, "0")}`),
      semanticScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
      position: {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        z: (Math.random() - 0.5) * 200,
      },
    });
  }

  return { nodes };
}

// Generate realistic service performance data
export function generateServiceData() {
  const services = [
    "ai-agent-service",
    "auth-service",
    "sync-service",
    "document-service",
    "notification-service",
    "gateway-service",
    "user-service",
    "dashboard-service",
  ];

  const statuses = ["healthy", "warning", "error"];
  const weights = [0.7, 0.2, 0.1]; // Most services healthy

  return services.map((name) => {
    const randomValue = Math.random();
    let status = "healthy";
    let cumulativeWeight = 0;

    for (let i = 0; i < statuses.length; i++) {
      cumulativeWeight += weights[i];
      if (randomValue <= cumulativeWeight) {
        status = statuses[i];
        break;
      }
    }

    return {
      name,
      status,
      responseTime: Math.floor(Math.random() * 300) + 50,
      uptime:
        status === "healthy"
          ? 99.5 + Math.random() * 0.5
          : status === "warning"
            ? 98 + Math.random() * 1.5
            : 95 + Math.random() * 3,
      requestsPerMinute: Math.floor(Math.random() * 500) + 100,
    };
  });
}

// WebSocket simulation data
export function generateWebSocketEvents() {
  const eventTypes = [
    "user-join",
    "user-leave",
    "document-edit",
    "cursor-move",
    "conflict-detected",
    "conflict-resolved",
  ];

  return eventTypes.map((type) => ({
    type,
    timestamp: new Date().toISOString(),
    userId: `user-${Math.floor(Math.random() * 10) + 1}`,
    data: {
      message: `Mock ${type} event`,
      fileId: `doc-${Math.floor(Math.random() * 5) + 1}`,
      position: {
        x: Math.floor(Math.random() * 400),
        y: Math.floor(Math.random() * 300),
      },
    },
  }));
}

// Export enhanced mock data
export const enhancedMockData = {
  ...mockData,
  collaboration: {
    ...mockData.collaboration,
    heatmapData: generateHeatmapData(50, 7),
    activeUsers: generateActiveUsers(15),
  },
  ai: {
    ...mockData.ai,
    contextFlow: generate3DContextFlow(),
  },
  performance: {
    ...mockData.performance,
    services: generateServiceData(),
  },
  realtime: {
    events: generateWebSocketEvents(),
  },
};
