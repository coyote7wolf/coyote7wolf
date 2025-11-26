import type { ContextFlowNode, ContextFlowGraph } from "@/stores/types";

/**
 * 3D Context Flow 數據生成器
 * 生成具有真實語意關係的 3D 節點網絡
 */
export class ContextFlow3DGenerator {
  private readonly nodeTypes = [
    "document",
    "code",
    "discussion",
    "task",
    "decision",
  ] as const;
  private readonly clusterThemes = [
    "Authentication System",
    "Database Schema",
    "UI Components",
    "API Integration",
    "User Management",
    "Performance Optimization",
    "Security Implementation",
    "Testing Framework",
  ];

  /**
   * 生成完整的 3D Context Flow 圖
   */
  generateContextFlowGraph(): ContextFlowGraph {
    const nodes = this.generateNodes();
    const clusters = this.generateClusters(nodes);

    // 建立節點間的連接關係
    this.establishConnections(nodes);

    console.log(
      `🌐 生成 3D Context Flow: ${nodes.length} 節點, ${clusters.length} 集群`
    );

    return { nodes, clusters };
  }

  /**
   * 生成節點網絡
   */
  private generateNodes(): ContextFlowNode[] {
    const nodes: ContextFlowNode[] = [];
    const nodeCount = 50 + Math.floor(Math.random() * 50); // 50-100 節點

    for (let i = 0; i < nodeCount; i++) {
      const node = this.createNode(i, nodes.length);
      nodes.push(node);
    }

    return nodes;
  }

  /**
   * 創建單個節點
   */
  private createNode(index: number, totalNodes: number): ContextFlowNode {
    const type =
      this.nodeTypes[Math.floor(Math.random() * this.nodeTypes.length)];

    // 基於節點類型生成位置（形成自然集群）
    const clusterIndex = Math.floor(
      index / (totalNodes / this.clusterThemes.length + 1)
    );
    const basePosition = this.getClusterBasePosition(clusterIndex);

    // 在集群周圍添加隨機偏移
    const position = {
      x: basePosition.x + (Math.random() - 0.5) * 200,
      y: basePosition.y + (Math.random() - 0.5) * 200,
      z: basePosition.z + (Math.random() - 0.5) * 200,
    };

    // 根據類型生成語意分數
    const semanticScore = this.calculateSemanticScore(type, clusterIndex);

    return {
      id: `node_${index + 1}`,
      type,
      label: this.generateNodeLabel(type, index),
      position,
      semanticScore,
      connections: [], // 稍後建立
      metadata: {
        author: this.getRandomAuthor(),
        timestamp: this.getRandomTimestamp(),
        size: Math.floor(Math.random() * 10000) + 1000,
        importance: Math.random(),
        tags: this.generateTags(type, clusterIndex),
      },
    };
  }

  /**
   * 獲取集群基礎位置
   */
  private getClusterBasePosition(clusterIndex: number): {
    x: number;
    y: number;
    z: number;
  } {
    const angle = (clusterIndex / this.clusterThemes.length) * Math.PI * 2;
    const radius = 300;
    const height = ((clusterIndex % 3) - 1) * 100; // 三層分布

    return {
      x: Math.cos(angle) * radius,
      y: height,
      z: Math.sin(angle) * radius,
    };
  }

  /**
   * 計算語意分數
   */
  private calculateSemanticScore(type: string, clusterIndex: number): number {
    // 基礎分數
    const baseScores = {
      document: 0.7,
      code: 0.8,
      discussion: 0.6,
      task: 0.75,
      decision: 0.85,
    };

    const baseScore = baseScores[type as keyof typeof baseScores];

    // 添加集群相關性
    const clusterBonus = (Math.sin(clusterIndex * 0.5) + 1) * 0.1;

    // 添加隨機變化
    const randomVariation = (Math.random() - 0.5) * 0.2;

    return Math.max(
      0.1,
      Math.min(1.0, baseScore + clusterBonus + randomVariation)
    );
  }

  /**
   * 生成節點標籤
   */
  private generateNodeLabel(type: string, index: number): string {
    const labelTemplates = {
      document: [
        "API Documentation",
        "Requirements Spec",
        "Design Guidelines",
        "User Manual",
        "Technical Spec",
        "Architecture Overview",
      ],
      code: [
        "UserService.ts",
        "AuthController.js",
        "DatabaseSchema.sql",
        "ComponentLibrary.vue",
        "APIClient.ts",
        "ValidationUtils.js",
      ],
      discussion: [
        "Code Review #432",
        "Feature Discussion",
        "Bug Analysis",
        "Performance Review",
        "Security Audit",
        "UX Feedback",
      ],
      task: [
        "Implement Authentication",
        "Fix Database Migration",
        "Update UI Components",
        "Optimize Performance",
        "Add Unit Tests",
        "Deploy to Production",
      ],
      decision: [
        "Tech Stack Selection",
        "Architecture Decision",
        "Design Pattern Choice",
        "Performance Strategy",
        "Security Protocol",
        "Deployment Method",
      ],
    };

    const templates = labelTemplates[type as keyof typeof labelTemplates];
    const template = templates[index % templates.length];

    // 添加編號使標籤唯一
    return `${template} ${Math.floor(index / templates.length) + 1}`;
  }

  /**
   * 建立節點間的連接
   */
  private establishConnections(nodes: ContextFlowNode[]): void {
    nodes.forEach((node) => {
      const connectionCount = Math.floor(Math.random() * 8) + 2; // 2-10 連接
      const potentialConnections = nodes.filter((n) => n.id !== node.id);

      // 按距離和語意相似性排序
      const sortedConnections = potentialConnections
        .map((target) => ({
          node: target,
          score: this.calculateConnectionScore(node, target),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, connectionCount);

      node.connections = sortedConnections.map((conn) => conn.node.id);
    });
  }

  /**
   * 計算連接分數
   */
  private calculateConnectionScore(
    source: ContextFlowNode,
    target: ContextFlowNode
  ): number {
    // 距離因子（越近越好）
    const distance = Math.sqrt(
      Math.pow(source.position.x - target.position.x, 2) +
        Math.pow(source.position.y - target.position.y, 2) +
        Math.pow(source.position.z - target.position.z, 2)
    );
    const distanceScore = Math.max(0, (500 - distance) / 500);

    // 語意相似性（分數越接近越好）
    const semanticSimilarity =
      1 - Math.abs(source.semanticScore - target.semanticScore);

    // 類型相關性
    const typeCompatibility = this.getTypeCompatibility(
      source.type,
      target.type
    );

    // 標籤相似性
    const labelSimilarity = this.calculateLabelSimilarity(
      source.label,
      target.label
    );

    // 綜合分數
    return (
      distanceScore * 0.3 +
      semanticSimilarity * 0.3 +
      typeCompatibility * 0.2 +
      labelSimilarity * 0.2 +
      Math.random() * 0.1 // 添加隨機性
    );
  }

  /**
   * 獲取類型兼容性
   */
  private getTypeCompatibility(type1: string, type2: string): number {
    const compatibilityMatrix: Record<string, Record<string, number>> = {
      document: {
        document: 0.8,
        code: 0.9,
        discussion: 0.7,
        task: 0.6,
        decision: 0.8,
      },
      code: {
        document: 0.9,
        code: 0.7,
        discussion: 0.8,
        task: 0.9,
        decision: 0.6,
      },
      discussion: {
        document: 0.7,
        code: 0.8,
        discussion: 0.6,
        task: 0.8,
        decision: 0.9,
      },
      task: {
        document: 0.6,
        code: 0.9,
        discussion: 0.8,
        task: 0.5,
        decision: 0.7,
      },
      decision: {
        document: 0.8,
        code: 0.6,
        discussion: 0.9,
        task: 0.7,
        decision: 0.5,
      },
    };

    return compatibilityMatrix[type1]?.[type2] || 0.5;
  }

  /**
   * 計算標籤相似性
   */
  private calculateLabelSimilarity(label1: string, label2: string): number {
    const words1 = label1.toLowerCase().split(/\s+/);
    const words2 = label2.toLowerCase().split(/\s+/);

    const commonWords = words1.filter((word) => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;

    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }

  /**
   * 生成集群
   */
  private generateClusters(
    nodes: ContextFlowNode[]
  ): ContextFlowGraph["clusters"] {
    const clusters: ContextFlowGraph["clusters"] = [];
    const nodesPerCluster = Math.ceil(nodes.length / this.clusterThemes.length);

    this.clusterThemes.forEach((theme, index) => {
      const startIndex = index * nodesPerCluster;
      const endIndex = Math.min(startIndex + nodesPerCluster, nodes.length);
      const clusterNodes = nodes.slice(startIndex, endIndex);

      if (clusterNodes.length === 0) return;

      // 計算集群中心
      const center = {
        x:
          clusterNodes.reduce((sum, node) => sum + node.position.x, 0) /
          clusterNodes.length,
        y:
          clusterNodes.reduce((sum, node) => sum + node.position.y, 0) /
          clusterNodes.length,
        z:
          clusterNodes.reduce((sum, node) => sum + node.position.z, 0) /
          clusterNodes.length,
      };

      clusters.push({
        id: `cluster_${index + 1}`,
        name: theme,
        nodeIds: clusterNodes.map((node) => node.id),
        center,
        color: this.getClusterColor(index),
      });
    });

    return clusters;
  }

  /**
   * 獲取集群顏色
   */
  private getClusterColor(index: number): string {
    const colors = [
      "#3b82f6", // blue
      "#10b981", // green
      "#f59e0b", // yellow
      "#ef4444", // red
      "#8b5cf6", // purple
      "#06b6d4", // cyan
      "#f97316", // orange
      "#84cc16", // lime
    ];
    return colors[index % colors.length];
  }

  /**
   * 生成標籤
   */
  private generateTags(type: string, _clusterIndex: number): string[] {
    const commonTags = [
      "important",
      "active",
      "recent",
      "reviewed",
      "archived",
    ];
    const typeSpecificTags = {
      document: ["specification", "guideline", "manual", "documentation"],
      code: ["typescript", "javascript", "vue", "api", "component"],
      discussion: ["review", "feedback", "analysis", "brainstorm"],
      task: ["todo", "in-progress", "testing", "deployment"],
      decision: ["architecture", "design", "strategy", "approved"],
    };

    const tags = [
      ...commonTags,
      ...typeSpecificTags[type as keyof typeof typeSpecificTags],
    ];
    const selectedTags = tags
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 4) + 1);

    return selectedTags;
  }

  /**
   * 獲取隨機作者
   */
  private getRandomAuthor(): string {
    const authors = [
      "Alice Chen",
      "Bob Wilson",
      "Carol Kim",
      "David Lee",
      "Emma Zhang",
      "Frank Miller",
      "Grace Liu",
      "Henry Wang",
      "Iris Johnson",
      "Jack Brown",
    ];
    return authors[Math.floor(Math.random() * authors.length)];
  }

  /**
   * 獲取隨機時間戳
   */
  private getRandomTimestamp(): Date {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30); // 過去30天內
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);

    return new Date(
      now.getTime() -
        daysAgo * 24 * 60 * 60 * 1000 -
        hoursAgo * 60 * 60 * 1000 -
        minutesAgo * 60 * 1000
    );
  }

  /**
   * 動態更新節點位置（用於動畫效果）
   */
  animateNodes(nodes: ContextFlowNode[], deltaTime: number): void {
    nodes.forEach((node) => {
      // 添加微小的浮動動畫
      const time = Date.now() * 0.001;
      const nodeIndex = parseInt(node.id.split("_")[1]);

      node.position.y += Math.sin(time + nodeIndex * 0.1) * 0.5;

      // 基於連接強度的吸引/排斥力
      const connectedNodes = nodes.filter((n) =>
        node.connections.includes(n.id)
      );
      connectedNodes.forEach((connectedNode) => {
        const dx = connectedNode.position.x - node.position.x;
        const dy = connectedNode.position.y - node.position.y;
        const dz = connectedNode.position.z - node.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance > 0) {
          const force =
            (node.semanticScore + connectedNode.semanticScore) * 0.01;
          const normalizedDistance = Math.max(50, Math.min(300, distance));
          const attraction = (200 - normalizedDistance) * force * deltaTime;

          node.position.x += (dx / distance) * attraction * 0.01;
          node.position.y += (dy / distance) * attraction * 0.01;
          node.position.z += (dz / distance) * attraction * 0.01;
        }
      });
    });
  }
}

// 單例實例
export const contextFlow3DGenerator = new ContextFlow3DGenerator();
