/**
 * 3D 性能優化工具集
 * 實現 LOD (Level of Detail)、視錐剔除、Web Worker 計算卸載
 */

import * as THREE from "three";

// LOD (Level of Detail) 管理器
export class LODManager {
  private lodLevels: Map<string, THREE.LOD> = new Map();
  private camera: THREE.Camera;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
  }

  /**
   * 創建 LOD 對象
   * @param id 唯一標識符
   * @param highDetail 高細節模型
   * @param mediumDetail 中等細節模型
   * @param lowDetail 低細節模型
   * @param distances LOD 切換距離
   */
  createLOD(
    id: string,
    highDetail: THREE.Object3D,
    mediumDetail: THREE.Object3D,
    lowDetail: THREE.Object3D,
    distances: { high: number; medium: number; low: number } = {
      high: 50,
      medium: 100,
      low: 200,
    }
  ): THREE.LOD {
    const lod = new THREE.LOD();

    // 添加不同細節層級
    lod.addLevel(highDetail, 0);
    lod.addLevel(mediumDetail, distances.high);
    lod.addLevel(lowDetail, distances.medium);

    // 設置自動更新
    lod.autoUpdate = true;

    this.lodLevels.set(id, lod);
    this.scene.add(lod);

    return lod;
  }

  /**
   * 手動更新所有 LOD 對象
   */
  updateLOD(): void {
    this.lodLevels.forEach((lod) => {
      lod.update(this.camera);
    });
  }

  /**
   * 移除 LOD 對象
   */
  removeLOD(id: string): void {
    const lod = this.lodLevels.get(id);
    if (lod) {
      this.scene.remove(lod);
      this.lodLevels.delete(id);
    }
  }

  /**
   * 獲取當前 LOD 統計
   */
  getLODStats(): { total: number; levels: Record<string, number> } {
    const stats = {
      total: this.lodLevels.size,
      levels: { high: 0, medium: 0, low: 0 },
    };

    this.lodLevels.forEach((lod) => {
      const currentLevel = lod.getCurrentLevel();
      switch (currentLevel) {
        case 0:
          stats.levels.high++;
          break;
        case 1:
          stats.levels.medium++;
          break;
        case 2:
          stats.levels.low++;
          break;
      }
    });

    return stats;
  }
}

// 視錐剔除管理器
export class FrustumCullingManager {
  private frustum: THREE.Frustum = new THREE.Frustum();
  private matrix: THREE.Matrix4 = new THREE.Matrix4();
  private camera: THREE.Camera;
  private culledObjects: Set<THREE.Object3D> = new Set();

  constructor(camera: THREE.Camera) {
    this.camera = camera;
  }

  /**
   * 更新視錐體
   */
  updateFrustum(): void {
    this.matrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.matrix);
  }

  /**
   * 檢查對象是否在視錐體內
   */
  isInFrustum(object: THREE.Object3D): boolean {
    // 獲取對象的包圍盒
    const box = new THREE.Box3().setFromObject(object);
    return this.frustum.intersectsBox(box);
  }

  /**
   * 批量剔除對象
   */
  cullObjects(objects: THREE.Object3D[]): {
    visible: THREE.Object3D[];
    culled: THREE.Object3D[];
  } {
    this.updateFrustum();

    const visible: THREE.Object3D[] = [];
    const culled: THREE.Object3D[] = [];

    objects.forEach((object) => {
      if (this.isInFrustum(object)) {
        object.visible = true;
        visible.push(object);
        this.culledObjects.delete(object);
      } else {
        object.visible = false;
        culled.push(object);
        this.culledObjects.add(object);
      }
    });

    return { visible, culled };
  }

  /**
   * 獲取剔除統計
   */
  getCullingStats(): { total: number; visible: number; culled: number } {
    return {
      total: this.culledObjects.size,
      visible: 0, // 需要外部提供
      culled: this.culledObjects.size,
    };
  }
}

// Web Worker 計算管理器
export class WebWorkerManager {
  private workers: Map<string, Worker> = new Map();
  private taskQueue: Array<{
    id: string;
    data: any;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  /**
   * 創建 Web Worker
   */
  createWorker(id: string, workerScript: string): Worker {
    const blob = new Blob([workerScript], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    worker.onmessage = (event) => {
      this.handleWorkerMessage(id, event.data);
    };

    worker.onerror = (error) => {
      console.error(`Worker ${id} error:`, error);
    };

    this.workers.set(id, worker);
    return worker;
  }

  /**
   * 向 Worker 發送任務
   */
  sendTask<T>(workerId: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const taskId = `${workerId}_${Date.now()}_${Math.random()}`;

      this.taskQueue.push({
        id: taskId,
        data: { ...data, taskId },
        resolve,
        reject,
      });

      const worker = this.workers.get(workerId);
      if (worker) {
        worker.postMessage({ ...data, taskId });
      } else {
        reject(new Error(`Worker ${workerId} not found`));
      }
    });
  }

  /**
   * 處理 Worker 回調
   */
  private handleWorkerMessage(workerId: string, data: any): void {
    const taskIndex = this.taskQueue.findIndex(
      (task) => task.id === data.taskId
    );
    if (taskIndex !== -1) {
      const task = this.taskQueue[taskIndex];
      if (data.error) {
        task.reject(new Error(data.error));
      } else {
        task.resolve(data.result);
      }
      this.taskQueue.splice(taskIndex, 1);
    }
  }

  /**
   * 終止所有 Worker
   */
  terminateAll(): void {
    this.workers.forEach((worker) => {
      worker.terminate();
    });
    this.workers.clear();
    this.taskQueue.length = 0;
  }

  /**
   * 獲取 Worker 統計
   */
  getWorkerStats(): {
    activeWorkers: number;
    pendingTasks: number;
    workerIds: string[];
  } {
    return {
      activeWorkers: this.workers.size,
      pendingTasks: this.taskQueue.length,
      workerIds: Array.from(this.workers.keys()),
    };
  }
}

// 內存管理器
export class MemoryManager {
  private textureCache: Map<string, THREE.Texture> = new Map();
  private geometryCache: Map<string, THREE.BufferGeometry> = new Map();
  private materialCache: Map<string, THREE.Material> = new Map();

  /**
   * 緩存紋理
   */
  cacheTexture(key: string, texture: THREE.Texture): THREE.Texture {
    if (this.textureCache.has(key)) {
      texture.dispose();
      return this.textureCache.get(key)!;
    }

    this.textureCache.set(key, texture);
    return texture;
  }

  /**
   * 緩存幾何體
   */
  cacheGeometry(
    key: string,
    geometry: THREE.BufferGeometry
  ): THREE.BufferGeometry {
    if (this.geometryCache.has(key)) {
      geometry.dispose();
      return this.geometryCache.get(key)!;
    }

    this.geometryCache.set(key, geometry);
    return geometry;
  }

  /**
   * 緩存材質
   */
  cacheMaterial(key: string, material: THREE.Material): THREE.Material {
    if (this.materialCache.has(key)) {
      material.dispose();
      return this.materialCache.get(key)!;
    }

    this.materialCache.set(key, material);
    return material;
  }

  /**
   * 清理未使用的資源
   */
  cleanup(): void {
    // 這裡應該實現更智能的清理邏輯
    // 例如：檢查資源的引用計數，清理未使用的資源

    const memoryInfo = (performance as any).memory;
    if (
      memoryInfo &&
      memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.8
    ) {
      // 內存使用超過 80%，開始清理
      this.forceCleanup();
    }
  }

  /**
   * 強制清理所有緩存
   */
  private forceCleanup(): void {
    this.textureCache.forEach((texture) => texture.dispose());
    this.geometryCache.forEach((geometry) => geometry.dispose());
    this.materialCache.forEach((material) => material.dispose());

    this.textureCache.clear();
    this.geometryCache.clear();
    this.materialCache.clear();

    console.log("🧽 Memory cache cleaned");
  }

  /**
   * 獲取內存統計
   */
  getMemoryStats(): {
    textures: number;
    geometries: number;
    materials: number;
    totalMemory?: number;
    usedMemory?: number;
  } {
    const memoryInfo = (performance as any).memory;

    return {
      textures: this.textureCache.size,
      geometries: this.geometryCache.size,
      materials: this.materialCache.size,
      totalMemory: memoryInfo?.jsHeapSizeLimit,
      usedMemory: memoryInfo?.usedJSHeapSize,
    };
  }
}

// 性能監控器
export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private maxFrameHistory = 60;
  private lastFrameTime = 0;
  private renderCalls = 0;
  private drawCalls = 0;

  /**
   * 開始幀測量
   */
  startFrame(): void {
    this.lastFrameTime = performance.now();
  }

  /**
   * 結束幀測量
   */
  endFrame(): void {
    const frameTime = performance.now() - this.lastFrameTime;
    this.frameTimes.push(frameTime);

    if (this.frameTimes.length > this.maxFrameHistory) {
      this.frameTimes.shift();
    }
  }

  /**
   * 記錄渲染調用
   */
  recordRenderCall(): void {
    this.renderCalls++;
  }

  /**
   * 記錄繪製調用
   */
  recordDrawCall(): void {
    this.drawCalls++;
  }

  /**
   * 獲取性能統計
   */
  getPerformanceStats(): {
    fps: number;
    averageFrameTime: number;
    minFrameTime: number;
    maxFrameTime: number;
    renderCalls: number;
    drawCalls: number;
  } {
    const avgFrameTime =
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const minFrameTime = Math.min(...this.frameTimes);
    const maxFrameTime = Math.max(...this.frameTimes);

    return {
      fps: Math.round(1000 / avgFrameTime),
      averageFrameTime: Math.round(avgFrameTime * 100) / 100,
      minFrameTime: Math.round(minFrameTime * 100) / 100,
      maxFrameTime: Math.round(maxFrameTime * 100) / 100,
      renderCalls: this.renderCalls,
      drawCalls: this.drawCalls,
    };
  }

  /**
   * 重置統計
   */
  reset(): void {
    this.frameTimes.length = 0;
    this.renderCalls = 0;
    this.drawCalls = 0;
  }
}

// Worker 腳本模板
export const trajectoryCalculationWorker = `
self.onmessage = function(event) {
  const { taskId, trajectoryData, timeRange, density } = event.data;
  
  try {
    // 計算軌跡點
    const calculatedTrajectory = calculateTrajectoryPoints(trajectoryData, timeRange, density);
    
    self.postMessage({
      taskId,
      result: calculatedTrajectory
    });
  } catch (error) {
    self.postMessage({
      taskId,
      error: error.message
    });
  }
};

function calculateTrajectoryPoints(data, timeRange, density) {
  const points = [];
  const totalTime = timeRange.end - timeRange.start;
  const timeStep = totalTime / density;
  
  for (let i = 0; i <= density; i++) {
    const t = i / density;
    const time = timeRange.start + i * timeStep;
    
    // 三次貝塞爾曲線插值
    const point = cubicBezierInterpolation(data.controlPoints, t);
    points.push({
      position: point,
      timestamp: time,
      userId: data.userId
    });
  }
  
  return points;
}

function cubicBezierInterpolation(controlPoints, t) {
  const [p0, p1, p2, p3] = controlPoints;
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
    z: uuu * p0.z + 3 * uu * t * p1.z + 3 * u * tt * p2.z + ttt * p3.z
  };
}
`;

// 統一性能優化管理器
export class PerformanceOptimizer {
  public lodManager: LODManager;
  public frustumCullingManager: FrustumCullingManager;
  public webWorkerManager: WebWorkerManager;
  public memoryManager: MemoryManager;
  public performanceMonitor: PerformanceMonitor;

  private isEnabled = true;
  private optimizationLevel: "low" | "medium" | "high" = "medium";

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.lodManager = new LODManager(scene, camera);
    this.frustumCullingManager = new FrustumCullingManager(camera);
    this.webWorkerManager = new WebWorkerManager();
    this.memoryManager = new MemoryManager();
    this.performanceMonitor = new PerformanceMonitor();

    // 創建軌跡計算 Worker
    this.webWorkerManager.createWorker(
      "trajectory",
      trajectoryCalculationWorker
    );
  }

  /**
   * 設置優化等級
   */
  setOptimizationLevel(level: "low" | "medium" | "high"): void {
    this.optimizationLevel = level;
  }

  /**
   * 啟用/禁用優化
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 執行一幀優化
   */
  optimize(objects: THREE.Object3D[]): void {
    if (!this.isEnabled) return;

    this.performanceMonitor.startFrame();

    // LOD 更新
    if (this.optimizationLevel !== "low") {
      this.lodManager.updateLOD();
    }

    // 視錐剔除
    if (this.optimizationLevel === "high") {
      this.frustumCullingManager.cullObjects(objects);
    }

    // 內存清理
    if (Math.random() < 0.01) {
      // 1% 概率執行清理
      this.memoryManager.cleanup();
    }

    this.performanceMonitor.endFrame();
  }

  /**
   * 獲取綜合統計
   */
  getStats(): {
    lod: ReturnType<LODManager["getLODStats"]>;
    culling: ReturnType<FrustumCullingManager["getCullingStats"]>;
    workers: ReturnType<WebWorkerManager["getWorkerStats"]>;
    memory: ReturnType<MemoryManager["getMemoryStats"]>;
    performance: ReturnType<PerformanceMonitor["getPerformanceStats"]>;
  } {
    return {
      lod: this.lodManager.getLODStats(),
      culling: this.frustumCullingManager.getCullingStats(),
      workers: this.webWorkerManager.getWorkerStats(),
      memory: this.memoryManager.getMemoryStats(),
      performance: this.performanceMonitor.getPerformanceStats(),
    };
  }

  /**
   * 清理所有資源
   */
  dispose(): void {
    this.webWorkerManager.terminateAll();
    this.memoryManager.cleanup();
    this.performanceMonitor.reset();
  }
}
