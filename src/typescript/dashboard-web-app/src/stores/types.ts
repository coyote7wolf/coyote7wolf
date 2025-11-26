// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  loginTime: string;
  lastActive: string;
  permissions: string[];
  avatar: string;
  preferences: {
    theme: "light" | "dark";
    language: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Dashboard Types
export interface SystemHealth {
  status: "healthy" | "warning" | "error";
  uptime: string;
  lastIncident: string;
}

export interface KPIs {
  activeUsers: number;
  collaborationSessions: number;
  resolvedConflicts: number;
  aiSuggestionRate: number;
}

export interface RealtimeMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  diskUsage: number;
}

// Collaboration Types
export interface HeatmapPoint {
  userId: string;
  userName: string;
  fileId: string;
  fileName: string;
  editCount: number;
  timestamp: string;
  x: number;
  y: number;
  intensity: number;
}

export interface ConflictStats {
  total: number;
  resolved: number;
  pending: number;
  autoResolved: number;
  manualResolved: number;
  types: {
    textConflict: number;
    formatConflict: number;
    structuralConflict: number;
  };
  resolutionTimes: {
    average: number;
    median: number;
    p95: number;
  };
}

export interface ActiveUser {
  id: string;
  name: string;
  avatar: string;
  status: "editing" | "viewing" | "commenting" | "idle";
  currentFile: string;
  lastActivity: string;
  cursor: { x: number; y: number };
}

// AI Types
export interface LLMUsage {
  totalTokens: number;
  costThisMonth: number;
  avgTokensPerRequest: number;
  topModels: Array<{
    name: string;
    usage: number;
    cost: number;
  }>;
  suggestionAcceptRate: number;
  dailyUsage: Array<{
    date: string;
    tokens: number;
    requests: number;
  }>;
}

export interface ContextFlowNode {
  id: string;
  type: "document" | "code" | "discussion" | "task" | "decision";
  label: string;
  connections: string[];
  semanticScore: number;
  position: { x: number; y: number; z: number };
  metadata?: {
    author?: string;
    timestamp?: Date;
    size?: number;
    importance?: number;
    tags?: string[];
  };
}

export interface ContextFlow {
  nodes: ContextFlowNode[];
}

export interface ContextFlowGraph {
  nodes: ContextFlowNode[];
  clusters: {
    id: string;
    name: string;
    nodeIds: string[];
    center: { x: number; y: number; z: number };
    color: string;
  }[];
}

export interface TeamRecommendation {
  type: string;
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

// Performance Types
export interface WebSocketMetrics {
  connections: number;
  averageLatency: number;
  uptime: number;
  messagesPerSecond: number;
  errorRate: number;
}

export interface RedisMetrics {
  hitRate: number;
  memoryUsage: number;
  keyCount: number;
  expiredKeys: number;
  evictedKeys: number;
}

export interface ServiceStatus {
  name: string;
  status: "healthy" | "warning" | "error";
  responseTime: number;
  uptime: number;
  requestsPerMinute: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: string;
  timestamp: string;
  userId: string;
  data: any;
}

// Real-time Data Types
export interface DashboardMetrics {
  activeUsers: number;
  systemHealth: "healthy" | "warning" | "error";
  totalCollaborations: number;
  successfulSyncs: number;
  pendingConflicts: number;
  averageResponseTime: number;
  dataTransferred: number;
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
}

export interface CollaborationStats {
  activeCollaborations: number;
  recentConflicts: number;
  resolvedConflicts: number;
  averageResolutionTime: number;
  topCollaborators: Array<{
    name: string;
    edits: number;
  }>;
  hotspots: Array<{
    document: string;
    editCount: number;
    lastEdit: string;
  }>;
}

export interface AIInsights {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  tokensUsed: number;
  costToday: number;
  topModels: Array<{
    name: string;
    usage: number;
  }>;
  suggestionAcceptRate: number;
}

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    incoming: number;
    outgoing: number;
  };
  responseTime: number;
  throughput: number;
  errorRate: number;
  activeConnections: number;
}

export interface RealtimeUpdate<T> {
  timestamp: string;
  event: string;
  data: T;
}
