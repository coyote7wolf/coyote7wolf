<template>
  <div class="w-full h-full relative overflow-hidden" ref="containerRef">
    <!-- 控制面板 -->
    <div
      class="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto"
    >
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        3D 協作空間控制
      </h3>

      <div class="space-y-4">
        <!-- 視圖模式切換 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block"
            >視圖模式</label
          >
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="mode in viewModes"
              :key="mode.id"
              @click="setViewMode(mode.id)"
              class="px-2 py-1 text-xs rounded transition-colors"
              :class="
                currentViewMode === mode.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              "
            >
              {{ mode.icon }} {{ mode.name }}
            </button>
          </div>
        </div>

        <!-- 顯示選項 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block"
            >顯示選項</label
          >
          <div class="space-y-2">
            <label
              v-for="option in displayOptions"
              :key="option.key"
              class="flex items-center"
            >
              <input
                type="checkbox"
                :checked="option.value"
                @change="toggleDisplayOption(option.key)"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-xs text-gray-700 dark:text-gray-300">{{
                option.label
              }}</span>
            </label>
          </div>
        </div>

        <!-- 時間控制 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block"
          >
            時間範圍 ({{ formatTime(timeRange.start) }} -
            {{ formatTime(timeRange.end) }})
          </label>
          <div class="space-y-2">
            <input
              type="range"
              :min="0"
              :max="maxTimeRange"
              :step="3600"
              v-model="timeRange.start"
              class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="range"
              :min="timeRange.start"
              :max="maxTimeRange"
              :step="3600"
              v-model="timeRange.end"
              class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div class="flex items-center mt-2 space-x-2">
            <button
              @click="playAnimation"
              class="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
            >
              {{ isPlaying ? "⏸️ 暫停" : "▶️ 播放" }}
            </button>
            <button
              @click="resetTimeRange"
              class="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              🔄 重置
            </button>
          </div>
        </div>

        <!-- 用戶篩選 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block"
          >
            用戶篩選 ({{ visibleUsers.length }}/{{ allUsers.length }})
          </label>
          <div class="max-h-32 overflow-y-auto space-y-1">
            <label
              v-for="user in allUsers"
              :key="user.id"
              class="flex items-center"
            >
              <input
                type="checkbox"
                :checked="visibleUsers.includes(user.id)"
                @change="toggleUser(user.id)"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div
                class="w-3 h-3 rounded-full ml-2 mr-1"
                :style="{ backgroundColor: user.color }"
              ></div>
              <span class="text-xs text-gray-700 dark:text-gray-300">{{
                user.name
              }}</span>
            </label>
          </div>
        </div>

        <!-- 性能設置 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block"
            >性能設置</label
          >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >軌跡密度</span
              >
              <select
                v-model="performanceSettings.trajectoryDensity"
                class="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >粒子效果</span
              >
              <input
                type="checkbox"
                v-model="performanceSettings.particles"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600 dark:text-gray-400">陰影</span>
              <input
                type="checkbox"
                v-model="performanceSettings.shadows"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <!-- 協作追蹤設置 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block"
            >協作追蹤</label
          >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >3D光標軌跡</span
              >
              <input
                type="checkbox"
                v-model="collaborationSettings.showCursorTrails"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >用戶標籤</span
              >
              <input
                type="checkbox"
                v-model="collaborationSettings.showUserLabels"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >碰撞檢測</span
              >
              <input
                type="checkbox"
                v-model="collaborationSettings.enableCollisionDetection"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >即時光標</span
              >
              <input
                type="checkbox"
                v-model="collaborationSettings.showRealtimeCursors"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >近距離連接</span
              >
              <input
                type="checkbox"
                v-model="collaborationSettings.showProximityConnections"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div>
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >軌跡長度: {{ collaborationSettings.cursorTrailLength }}</span
              >
              <input
                type="range"
                min="5"
                max="50"
                v-model="collaborationSettings.cursorTrailLength"
                class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
              />
            </div>
            <div>
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >碰撞半徑: {{ collaborationSettings.collisionRadius }}m</span
              >
              <input
                type="range"
                min="1"
                max="15"
                v-model="collaborationSettings.collisionRadius"
                class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>

        <!-- 性能優化設置 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block"
            >性能優化</label
          >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >LOD 優化</span
              >
              <input
                type="checkbox"
                v-model="optimizationSettings.enableLOD"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >視錐剔除</span
              >
              <input
                type="checkbox"
                v-model="optimizationSettings.enableFrustumCulling"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >Web Workers</span
              >
              <input
                type="checkbox"
                v-model="optimizationSettings.enableWebWorkers"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >優化等級</span
              >
              <select
                v-model="optimizationSettings.optimizationLevel"
                class="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            <div>
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >最大物件: {{ optimizationSettings.maxObjects }}</span
              >
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                v-model="optimizationSettings.maxObjects"
                class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
              />
            </div>
            <div>
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >剔除距離: {{ optimizationSettings.cullingDistance }}m</span
              >
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                v-model="optimizationSettings.cullingDistance"
                class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用戶信息面板 -->
    <div
      v-if="selectedUser"
      class="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 w-80"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
          用戶詳情
        </h3>
        <button
          @click="selectedUser = null"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div class="space-y-3">
        <div class="flex items-center space-x-3">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            :style="{ backgroundColor: selectedUser.color }"
          >
            {{ selectedUser.name.charAt(0) }}
          </div>
          <div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ selectedUser.name }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ selectedUser.role }}
            </div>
          </div>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">協作時長:</span>
            <span class="text-gray-900 dark:text-white"
              >{{ selectedUser.totalTime }}h</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">編輯次數:</span>
            <span class="text-gray-900 dark:text-white">{{
              selectedUser.editCount
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">移動距離:</span>
            <span class="text-gray-900 dark:text-white"
              >{{ selectedUser.distance }}m</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">活躍區域:</span>
            <span class="text-gray-900 dark:text-white">{{
              selectedUser.activeZones.join(", ")
            }}</span>
          </div>
        </div>

        <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            最近活動:
          </div>
          <div class="space-y-1 max-h-24 overflow-y-auto">
            <div
              v-for="activity in selectedUser.recentActivities"
              :key="activity.id"
              class="text-xs text-gray-600 dark:text-gray-400"
            >
              <span class="text-gray-500">{{
                formatTime(activity.timestamp)
              }}</span>
              - {{ activity.action }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 統計面板 -->
    <div
      class="absolute bottom-4 left-4 z-10 bg-black/70 text-white text-xs p-3 rounded font-mono"
    >
      <div class="grid grid-cols-2 gap-x-6 gap-y-1">
        <div>FPS: {{ fps }}</div>
        <div>Objects: {{ objectCount }}</div>
        <div>Users: {{ visibleUsers.length }}</div>
        <div>Trajectories: {{ trajectoryCount }}</div>
        <div>Memory: {{ memoryUsage }}MB</div>
        <div>Time: {{ formatTime(currentTime) }}</div>
      </div>
    </div>

    <!-- Three.js 容器 -->
    <div
      ref="threeContainer"
      class="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900"
    ></div>

    <!-- Loading 狀態 -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-black/50 flex items-center justify-center z-20"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-700 dark:text-gray-300">載入 3D 協作空間...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import * as THREE from "three";
import { PerformanceOptimizer } from "@/utils/performanceOptimizer";

interface CollaborationUser {
  id: string;
  name: string;
  role: string;
  color: string;
  totalTime: number;
  editCount: number;
  distance: number;
  activeZones: string[];
  recentActivities: Array<{
    id: string;
    timestamp: Date;
    action: string;
  }>;
}

interface TrajectoryPoint {
  position: THREE.Vector3;
  timestamp: Date;
  action: "move" | "edit" | "idle" | "select";
  intensity: number;
}

interface UserTrajectory {
  userId: string;
  points: TrajectoryPoint[];
}

// Props
interface Props {
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 1200,
  height: 800,
});

// Refs
const containerRef = ref<HTMLElement>();
const threeContainer = ref<HTMLElement>();
const isLoading = ref(true);
const selectedUser = ref<CollaborationUser | null>(null);

// 視圖狀態
const currentViewMode = ref("overview");
const isPlaying = ref(false);
const currentTime = ref(Date.now());

// 時間控制
const maxTimeRange = 7 * 24 * 3600 * 1000; // 7天
const timeRange = ref({
  start: 0,
  end: maxTimeRange,
});

// 顯示選項
const displayOptions = ref([
  { key: "trajectories", label: "用戶軌跡", value: true },
  { key: "heatmap", label: "協作熱力圖", value: true },
  { key: "connections", label: "用戶連接", value: false },
  { key: "workspaces", label: "工作區域", value: true },
  { key: "timeline", label: "時間線", value: false },
]);

// 性能設置
const performanceSettings = ref({
  trajectoryDensity: "medium",
  particles: true,
  shadows: true,
});

// 協作追蹤設置
const collaborationSettings = ref({
  showCursorTrails: true,
  showUserLabels: true,
  enableCollisionDetection: true,
  showRealtimeCursors: true,
  showProximityConnections: true,
  cursorTrailLength: 20,
  collisionRadius: 5,
  proximityThreshold: 15,
});

// 性能優化設置
const optimizationSettings = ref({
  enableLOD: true,
  enableFrustumCulling: true,
  enableWebWorkers: true,
  optimizationLevel: "medium" as "low" | "medium" | "high",
  maxObjects: 1000,
  cullingDistance: 200,
});

// 視圖模式
const viewModes = [
  { id: "overview", name: "總覽", icon: "🌐" },
  { id: "timeline", name: "時間線", icon: "📅" },
  { id: "heatmap", name: "熱力圖", icon: "🔥" },
  { id: "network", name: "協作網路", icon: "🕸️" },
];

// 性能監控
const fps = ref(0);
const objectCount = ref(0);
const trajectoryCount = ref(0);
const memoryUsage = ref(0);

// Three.js 對象
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let animationId: number;
let performanceOptimizer: PerformanceOptimizer;

// 數據
const allUsers = ref<CollaborationUser[]>([]);
const visibleUsers = ref<string[]>([]);
const userTrajectories = ref<UserTrajectory[]>([]);

// 場景對象
const trajectoryLines = new Map<string, THREE.Line>();
const userMarkers = new Map<string, THREE.Mesh>();
const workspaceAreas = new Map<string, THREE.Mesh>();

// 增強協作追蹤對象
const cursorTrails = new Map<string, THREE.Line[]>();
const userLabels = new Map<string, THREE.Sprite>();
const collisionSpheres = new Map<string, THREE.Mesh>();
const realtimeCursors = new Map<string, THREE.Mesh>();
const proximityConnections: THREE.Line[] = [];

// 計算屬性
const filteredTrajectories = computed(() => {
  return userTrajectories.value
    .filter((traj) => visibleUsers.value.includes(traj.userId))
    .map((traj) => ({
      ...traj,
      points: traj.points.filter(
        (point) =>
          point.timestamp.getTime() >= timeRange.value.start &&
          point.timestamp.getTime() <= timeRange.value.end
      ),
    }));
});

// 初始化 Three.js 場景
const initThreeJS = () => {
  if (!threeContainer.value) return;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0f);
  scene.fog = new THREE.Fog(0x0a0a0f, 50, 500);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    threeContainer.value.clientWidth / threeContainer.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 50, 100);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(
    threeContainer.value.clientWidth,
    threeContainer.value.clientHeight
  );
  renderer.shadowMap.enabled = performanceSettings.value.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  threeContainer.value.appendChild(renderer.domElement);

  setupControls();
  setupLighting();
  setupWorkspaceEnvironment();

  // 初始化性能優化器
  performanceOptimizer = new PerformanceOptimizer(scene, camera);
  performanceOptimizer.setOptimizationLevel(
    optimizationSettings.value.optimizationLevel
  );

  console.log("🎮 3D 协作空間場景初始化完成");
};

// 設置控制
const setupControls = () => {
  let isMouseDown = false;
  let previousMousePosition = { x: 0, y: 0 };
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // 滑鼠控制
  renderer.domElement.addEventListener("mousedown", (event) => {
    isMouseDown = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
  });

  renderer.domElement.addEventListener("mouseup", () => {
    isMouseDown = false;
  });

  renderer.domElement.addEventListener("mousemove", (event) => {
    if (isMouseDown) {
      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
      };

      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      spherical.theta -= deltaMove.x * 0.01;
      spherical.phi += deltaMove.y * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);

      previousMousePosition = { x: event.clientX, y: event.clientY };
    }
  });

  // 點擊檢測
  renderer.domElement.addEventListener("click", (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(
      Array.from(userMarkers.values())
    );

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const userId = mesh.userData.userId;
      const user = allUsers.value.find((u) => u.id === userId);
      if (user) {
        selectedUser.value = user;
      }
    } else {
      selectedUser.value = null;
    }
  });

  // 滾輪縮放
  renderer.domElement.addEventListener("wheel", (event) => {
    const scale = event.deltaY > 0 ? 1.1 : 0.9;
    camera.position.multiplyScalar(scale);
    camera.position.clampLength(10, 300);
  });

  // 視窗大小調整
  window.addEventListener("resize", () => {
    if (!threeContainer.value) return;
    camera.aspect =
      threeContainer.value.clientWidth / threeContainer.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
      threeContainer.value.clientWidth,
      threeContainer.value.clientHeight
    );
  });
};

// 設置光照
const setupLighting = () => {
  // 環境光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambientLight);

  // 主光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 50);
  directionalLight.castShadow = performanceSettings.value.shadows;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // 補光
  const pointLight1 = new THREE.PointLight(0x00ff88, 0.5, 100);
  pointLight1.position.set(-25, 25, 25);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xff0088, 0.3, 100);
  pointLight2.position.set(25, 25, -25);
  scene.add(pointLight2);
};

// 設置工作空間環境
const setupWorkspaceEnvironment = () => {
  // 工作區域平面
  const workspaceAreaList = [
    {
      name: "Frontend",
      position: { x: -30, z: -30 },
      size: { w: 25, h: 25 },
      color: 0x3b82f6,
    },
    {
      name: "Backend",
      position: { x: 30, z: -30 },
      size: { w: 25, h: 25 },
      color: 0x10b981,
    },
    {
      name: "Database",
      position: { x: -30, z: 30 },
      size: { w: 25, h: 25 },
      color: 0xf59e0b,
    },
    {
      name: "Documentation",
      position: { x: 30, z: 30 },
      size: { w: 25, h: 25 },
      color: 0x8b5cf6,
    },
  ];

  workspaceAreaList.forEach((area) => {
    const geometry = new THREE.PlaneGeometry(area.size.w, area.size.h);
    const material = new THREE.MeshLambertMaterial({
      color: area.color,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(area.position.x, 0.1, area.position.z);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.userData = { type: "workspace", name: area.name };

    scene.add(mesh);
    workspaceAreas.set(area.name, mesh);

    // 添加標籤
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    // 提高解析度
    canvas.width = 1024;
    canvas.height = 256;
    // 抗鋸齒
    context.imageSmoothingEnabled = true;
    // 背景色
    context.fillStyle = `#${area.color.toString(16).padStart(6, "0")}`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    // 文字
    context.fillStyle = "white";
    context.font = "bold 96px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(area.name, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(area.position.x, 15, area.position.z);
    sprite.scale.set(40, 10, 1); // 放大標籤
    scene.add(sprite);
  });

  // 網格地面
  const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
  scene.add(gridHelper);
};

// 生成模擬數據
const generateMockData = () => {
  // 生成用戶數據
  const userNames = [
    "Alice Chen",
    "Bob Wilson",
    "Carol Kim",
    "David Lee",
    "Emma Zhang",
    "Frank Miller",
    "Grace Liu",
    "Henry Wang",
  ];
  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI Designer",
    "DevOps Engineer",
  ];
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#84cc16",
  ];

  allUsers.value = userNames.map((name, index) => ({
    id: `user_${index}`,
    name,
    role: roles[index % roles.length],
    color: colors[index % colors.length],
    totalTime: Math.random() * 40 + 10,
    editCount: Math.floor(Math.random() * 200) + 50,
    distance: Math.floor(Math.random() * 500) + 100,
    activeZones: ["Frontend", "Backend", "Database", "Documentation"].filter(
      () => Math.random() > 0.5
    ),
    recentActivities: Array.from({ length: 5 }, (_, i) => ({
      id: `activity_${i}`,
      timestamp: new Date(Date.now() - i * 30 * 60 * 1000),
      action: ["編輯檔案", "提交代碼", "審查 PR", "討論需求", "修復 Bug"][
        Math.floor(Math.random() * 5)
      ],
    })),
  }));

  visibleUsers.value = allUsers.value.map((u) => u.id);

  // 生成軌跡數據
  userTrajectories.value = allUsers.value.map((user) => {
    const points: TrajectoryPoint[] = [];
    const numPoints = 100 + Math.floor(Math.random() * 200);

    for (let i = 0; i < numPoints; i++) {
      const timestamp = new Date(Date.now() - (numPoints - i) * 60000);
      const t = i / numPoints;

      // 創建有趣的 3D 軌跡路徑
      const x = Math.sin(t * Math.PI * 4) * 40 + (Math.random() - 0.5) * 10;
      const y = Math.sin(t * Math.PI * 8) * 10 + 5;
      const z = Math.cos(t * Math.PI * 4) * 40 + (Math.random() - 0.5) * 10;

      points.push({
        position: new THREE.Vector3(x, y, z),
        timestamp,
        action: ["move", "edit", "idle", "select"][
          Math.floor(Math.random() * 4)
        ] as any,
        intensity: Math.random(),
      });
    }

    return {
      userId: user.id,
      points,
    };
  });

  console.log(
    `🎭 生成模擬數據: ${allUsers.value.length} 用戶, ${userTrajectories.value.length} 軌跡`
  );
};

// 創建用戶軌跡
const createUserTrajectories = () => {
  // 清除現有軌跡
  trajectoryLines.forEach((line) => scene.remove(line));
  trajectoryLines.clear();

  filteredTrajectories.value.forEach((trajectory) => {
    const user = allUsers.value.find((u) => u.id === trajectory.userId);
    if (!user || trajectory.points.length < 2) return;

    const points = trajectory.points.map((p) => p.position);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(user.color),
      transparent: true,
      opacity: 0.7,
      linewidth: 2,
    });

    const line = new THREE.Line(geometry, material);
    line.userData = { userId: user.id, type: "trajectory" };

    scene.add(line);
    trajectoryLines.set(user.id, line);

    // 添加軌跡點
    if (performanceSettings.value.particles) {
      const pointsGeometry = new THREE.BufferGeometry().setFromPoints(
        points.filter((_, i) => i % 5 === 0) // 降低密度
      );

      const pointsMaterial = new THREE.PointsMaterial({
        color: new THREE.Color(user.color),
        size: 2,
        transparent: true,
        opacity: 0.8,
      });

      const pointsObject = new THREE.Points(pointsGeometry, pointsMaterial);
      scene.add(pointsObject);
    }
  });

  trajectoryCount.value = trajectoryLines.size;
};

// 創建用戶標記
const createUserMarkers = () => {
  // 清除現有標記
  userMarkers.forEach((marker) => scene.remove(marker));
  userMarkers.clear();

  allUsers.value.forEach((user) => {
    if (!visibleUsers.value.includes(user.id)) return;

    const trajectory = userTrajectories.value.find((t) => t.userId === user.id);
    if (!trajectory || trajectory.points.length === 0) return;

    // 獲取最新位置
    const latestPoint = trajectory.points[trajectory.points.length - 1];

    // 創建用戶標記
    const geometry = new THREE.SphereGeometry(2, 16, 12);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(user.color),
      emissive: new THREE.Color(user.color).multiplyScalar(0.2),
      shininess: 100,
    });

    const marker = new THREE.Mesh(geometry, material);
    marker.position.copy(latestPoint.position);
    marker.castShadow = true;
    marker.userData = { userId: user.id, type: "userMarker" };

    scene.add(marker);
    userMarkers.set(user.id, marker);

    // 添加用戶名稱標籤
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.font = "18px Arial";
    context.textAlign = "center";
    context.fillText(user.name, canvas.width / 2, canvas.height / 2 + 6);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(latestPoint.position);
    sprite.position.y += 8;
    sprite.scale.set(15, 3.75, 1);
    scene.add(sprite);
  });
};

// 創建 3D 光標軌跡
const createCursorTrails = () => {
  if (!collaborationSettings.value.showCursorTrails) return;

  // 清除現有軌跡
  cursorTrails.forEach((trails) => {
    trails.forEach((trail) => scene.remove(trail));
  });
  cursorTrails.clear();

  allUsers.value.forEach((user) => {
    if (!visibleUsers.value.includes(user.id)) return;

    const trajectory = userTrajectories.value.find((t) => t.userId === user.id);
    if (!trajectory || trajectory.points.length < 2) return;

    const trails: THREE.Line[] = [];
    const trailLength = Math.min(
      collaborationSettings.value.cursorTrailLength,
      trajectory.points.length
    );

    for (let i = 0; i < trailLength && i < trajectory.points.length - 1; i++) {
      const startPoint =
        trajectory.points[trajectory.points.length - 1 - i - 1];
      const endPoint = trajectory.points[trajectory.points.length - 1 - i];

      const points = [startPoint.position, endPoint.position];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const opacity = ((trailLength - i) / trailLength) * 0.8;
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(user.color),
        transparent: true,
        opacity: opacity,
        linewidth: 3,
      });

      const trail = new THREE.Line(geometry, material);
      scene.add(trail);
      trails.push(trail);
    }

    if (trails.length > 0) {
      cursorTrails.set(user.id, trails);
    }
  });
};

// 創建用戶標籤
const createUserLabels = () => {
  if (!collaborationSettings.value.showUserLabels) return;

  // 清除現有標籤
  userLabels.forEach((label) => scene.remove(label));
  userLabels.clear();

  allUsers.value.forEach((user) => {
    if (!visibleUsers.value.includes(user.id)) return;

    const trajectory = userTrajectories.value.find((t) => t.userId === user.id);
    if (!trajectory || trajectory.points.length === 0) return;

    const latestPoint = trajectory.points[trajectory.points.length - 1];

    // 創建高級標籤
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.width = 300;
    canvas.height = 80;

    // 背景
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.roundRect(0, 0, canvas.width, canvas.height, 10);
    context.fill();

    // 邊框
    context.strokeStyle = user.color;
    context.lineWidth = 2;
    context.roundRect(0, 0, canvas.width, canvas.height, 10);
    context.stroke();

    // 用戶名
    context.fillStyle = "white";
    context.font = "bold 16px Arial";
    context.textAlign = "left";
    context.fillText(user.name, 15, 25);

    // 狀態信息
    context.fillStyle = "#ccc";
    context.font = "12px Arial";
    context.fillText(`狀態: ${user.status}`, 15, 45);
    context.fillText(`活動: ${latestPoint.activity}`, 15, 60);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1,
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(latestPoint.position);
    sprite.position.y += 12;
    sprite.scale.set(20, 5.3, 1);

    scene.add(sprite);
    userLabels.set(user.id, sprite);
  });
};

// 創建碰撞檢測球體
const createCollisionSpheres = () => {
  if (!collaborationSettings.value.enableCollisionDetection) return;

  // 清除現有碰撞球體
  collisionSpheres.forEach((sphere) => scene.remove(sphere));
  collisionSpheres.clear();

  allUsers.value.forEach((user) => {
    if (!visibleUsers.value.includes(user.id)) return;

    const trajectory = userTrajectories.value.find((t) => t.userId === user.id);
    if (!trajectory || trajectory.points.length === 0) return;

    const latestPoint = trajectory.points[trajectory.points.length - 1];

    const geometry = new THREE.SphereGeometry(
      collaborationSettings.value.collisionRadius,
      16,
      12
    );
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(user.color),
      transparent: true,
      opacity: 0.1,
      wireframe: true,
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(latestPoint.position);
    sphere.userData = { userId: user.id, type: "collisionSphere" };

    scene.add(sphere);
    collisionSpheres.set(user.id, sphere);
  });
};

// 創建即時光標
const createRealtimeCursors = () => {
  if (!collaborationSettings.value.showRealtimeCursors) return;

  // 清除現有光標
  realtimeCursors.forEach((cursor) => scene.remove(cursor));
  realtimeCursors.clear();

  allUsers.value.forEach((user) => {
    if (!visibleUsers.value.includes(user.id)) return;

    const trajectory = userTrajectories.value.find((t) => t.userId === user.id);
    if (!trajectory || trajectory.points.length === 0) return;

    const latestPoint = trajectory.points[trajectory.points.length - 1];

    // 創建光標形狀（箭頭）
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(2, -6);
    shape.lineTo(1, -4);
    shape.lineTo(4, -4);
    shape.lineTo(0, 0);

    const extrudeSettings = {
      depth: 0.5,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(user.color),
      emissive: new THREE.Color(user.color).multiplyScalar(0.3),
    });

    const cursor = new THREE.Mesh(geometry, material);
    cursor.position.copy(latestPoint.position);
    cursor.position.y += 1;
    cursor.rotation.x = -Math.PI / 2;
    cursor.userData = { userId: user.id, type: "realtimeCursor" };

    scene.add(cursor);
    realtimeCursors.set(user.id, cursor);
  });
};

// 創建近距離連接線
const createProximityConnections = () => {
  if (!collaborationSettings.value.showProximityConnections) return;

  // 清除現有連接線
  proximityConnections.forEach((line) => scene.remove(line));
  proximityConnections.length = 0;

  const activeUsers = allUsers.value.filter(
    (user) =>
      visibleUsers.value.includes(user.id) &&
      userTrajectories.value.find((t) => t.userId === user.id)?.points.length >
        0
  );

  for (let i = 0; i < activeUsers.length; i++) {
    for (let j = i + 1; j < activeUsers.length; j++) {
      const user1 = activeUsers[i];
      const user2 = activeUsers[j];

      const traj1 = userTrajectories.value.find((t) => t.userId === user1.id);
      const traj2 = userTrajectories.value.find((t) => t.userId === user2.id);

      if (!traj1 || !traj2) continue;

      const pos1 = traj1.points[traj1.points.length - 1].position;
      const pos2 = traj2.points[traj2.points.length - 1].position;

      const distance = pos1.distanceTo(pos2);

      if (distance <= collaborationSettings.value.proximityThreshold) {
        const points = [pos1, pos2];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const opacity =
          1 - distance / collaborationSettings.value.proximityThreshold;
        const material = new THREE.LineBasicMaterial({
          color: 0xffaa00,
          transparent: true,
          opacity: opacity * 0.6,
          linewidth: 2,
        });

        const line = new THREE.Line(geometry, material);
        scene.add(line);
        proximityConnections.push(line);
      }
    }
  }
};

// 檢測用戶間碰撞
const detectCollisions = () => {
  if (!collaborationSettings.value.enableCollisionDetection) return;

  const activeUsers = allUsers.value.filter(
    (user) =>
      visibleUsers.value.includes(user.id) &&
      userTrajectories.value.find((t) => t.userId === user.id)?.points.length >
        0
  );

  for (let i = 0; i < activeUsers.length; i++) {
    for (let j = i + 1; j < activeUsers.length; j++) {
      const user1 = activeUsers[i];
      const user2 = activeUsers[j];

      const traj1 = userTrajectories.value.find((t) => t.userId === user1.id);
      const traj2 = userTrajectories.value.find((t) => t.userId === user2.id);

      if (!traj1 || !traj2) continue;

      const pos1 = traj1.points[traj1.points.length - 1].position;
      const pos2 = traj2.points[traj2.points.length - 1].position;

      const distance = pos1.distanceTo(pos2);
      const collisionDistance = collaborationSettings.value.collisionRadius * 2;

      if (distance <= collisionDistance) {
        // 碰撞檢測到，可以觸發事件或視覺效果
        const sphere1 = collisionSpheres.get(user1.id);
        const sphere2 = collisionSpheres.get(user2.id);

        if (sphere1 && sphere2) {
          // 創建碰撞效果
          const originalColor1 = sphere1.material.color.clone();
          const originalColor2 = sphere2.material.color.clone();

          sphere1.material.color.setHex(0xff0000);
          sphere2.material.color.setHex(0xff0000);

          setTimeout(() => {
            sphere1.material.color.copy(originalColor1);
            sphere2.material.color.copy(originalColor2);
          }, 500);
        }
      }
    }
  }
};

// 控制方法
const setViewMode = (mode: string) => {
  currentViewMode.value = mode;

  switch (mode) {
    case "overview":
      camera.position.set(0, 80, 120);
      camera.lookAt(0, 0, 0);
      break;
    case "timeline":
      camera.position.set(0, 20, 80);
      camera.lookAt(0, 0, 0);
      break;
    case "heatmap":
      camera.position.set(0, 100, 0);
      camera.lookAt(0, 0, 0);
      break;
    case "network":
      camera.position.set(60, 60, 60);
      camera.lookAt(0, 0, 0);
      break;
  }
};

const toggleDisplayOption = (key: string) => {
  const option = displayOptions.value.find((opt) => opt.key === key);
  if (option) {
    option.value = !option.value;

    // 重新創建場景元素
    if (key === "trajectories") {
      createUserTrajectories();
    }
  }
};

const toggleUser = (userId: string) => {
  const index = visibleUsers.value.indexOf(userId);
  if (index > -1) {
    visibleUsers.value.splice(index, 1);
  } else {
    visibleUsers.value.push(userId);
  }
};

const playAnimation = () => {
  isPlaying.value = !isPlaying.value;
};

const resetTimeRange = () => {
  timeRange.value = { start: 0, end: maxTimeRange };
  currentTime.value = Date.now();
};

const formatTime = (timestamp: number | Date) => {
  const date = typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// 動畫循環
const animate = () => {
  animationId = requestAnimationFrame(animate);

  // 性能優化與監控
  if (performanceOptimizer) {
    // 收集所有可優化的對象
    const allObjects: THREE.Object3D[] = [];
    scene.traverse((object) => {
      if (object.type === "Mesh" || object.type === "Line") {
        allObjects.push(object);
      }
    });

    // 執行優化
    performanceOptimizer.setOptimizationLevel(
      optimizationSettings.value.optimizationLevel
    );
    performanceOptimizer.optimize(allObjects);

    // 獲取優化後的性能數據
    const perfStats = performanceOptimizer.getStats();
    fps.value = perfStats.performance.fps;
    memoryUsage.value = Math.round(
      (perfStats.memory.usedMemory || 0) / 1024 / 1024
    );
  } else {
    // 備用性能監控
    fps.value = Math.round(
      1000 / (performance.now() - (window as any).lastFrameTime || 0)
    );
    (window as any).lastFrameTime = performance.now();
    memoryUsage.value =
      Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024) ||
      0;
  }

  objectCount.value = scene.children.length;

  // 時間動畫
  if (isPlaying.value) {
    currentTime.value += 60000; // 每幀前進1分鐘
    if (currentTime.value > timeRange.value.end) {
      currentTime.value = timeRange.value.start;
    }
  }

  // 用戶標記動畫
  userMarkers.forEach((marker, userId) => {
    const time = Date.now() * 0.001;
    marker.position.y += Math.sin(time + userId.charCodeAt(0)) * 0.1;
  });

  // 即時光標動畫
  realtimeCursors.forEach((cursor, userId) => {
    const time = Date.now() * 0.001;
    cursor.rotation.z = Math.sin(time * 2 + userId.charCodeAt(0)) * 0.1;
    cursor.scale.setScalar(
      1 + Math.sin(time * 3 + userId.charCodeAt(0)) * 0.05
    );
  });

  // 檢測碰撞
  detectCollisions();

  renderer.render(scene, camera);
};

// 監聽器
watch(
  filteredTrajectories,
  () => {
    createUserTrajectories();
    createUserMarkers();
    createCursorTrails();
    createUserLabels();
    createCollisionSpheres();
    createRealtimeCursors();
    createProximityConnections();
  },
  { deep: true }
);

// 監聽協作設置變化
watch(
  collaborationSettings,
  () => {
    createCursorTrails();
    createUserLabels();
    createCollisionSpheres();
    createRealtimeCursors();
    createProximityConnections();
  },
  { deep: true }
);

watch(
  visibleUsers,
  () => {
    createUserTrajectories();
    createUserMarkers();
  },
  { deep: true }
);

watch(
  () => performanceSettings.value,
  () => {
    // 重新初始化場景以應用性能設置
    if (renderer) {
      renderer.shadowMap.enabled = performanceSettings.value.shadows;
    }
    createUserTrajectories();
  },
  { deep: true }
);

// 監聽優化設置變化
watch(
  () => optimizationSettings.value,
  () => {
    if (performanceOptimizer) {
      performanceOptimizer.setOptimizationLevel(
        optimizationSettings.value.optimizationLevel
      );
      performanceOptimizer.setEnabled(
        optimizationSettings.value.enableLOD ||
          optimizationSettings.value.enableFrustumCulling ||
          optimizationSettings.value.enableWebWorkers
      );
    }
  },
  { deep: true }
);

// 生命週期
onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  generateMockData();
  initThreeJS();
  createUserTrajectories();
  createUserMarkers();
  createCursorTrails();
  createUserLabels();
  createCollisionSpheres();
  createRealtimeCursors();
  createProximityConnections();
  animate();

  isLoading.value = false;
  console.log(
    "🌟 增強 3D 協作軌跡場景已載入完成 - 包含光標軌跡、碰撞檢測和近距離連接"
  );
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  // 清理性能優化器資源
  if (performanceOptimizer) {
    performanceOptimizer.dispose();
  }

  if (renderer) {
    renderer.dispose();
  }

  console.log("🧹 3D 協作軌跡組件已清理完成");
});
</script>

<style scoped>
/* 自定義滾動條 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(241, 245, 249, 0.5);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.8);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.8);
}

/* 透明背景效果 */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}
</style>
