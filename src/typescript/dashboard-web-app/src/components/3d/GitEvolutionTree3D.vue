<template>
  <div class="w-full h-full relative overflow-hidden" ref="containerRef">
    <!-- 控制面板 -->
    <div
      class="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto"
    >
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        版本演化樹控制
      </h3>

      <div class="space-y-4">
        <!-- 分支篩選 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block"
            >分支篩選</label
          >
          <div class="space-y-1 max-h-24 overflow-y-auto">
            <label
              v-for="branch in branches"
              :key="branch.name"
              class="flex items-center"
            >
              <input
                type="checkbox"
                :checked="visibleBranches.includes(branch.name)"
                @change="toggleBranch(branch.name)"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div
                class="w-3 h-3 rounded-full ml-2 mr-1"
                :style="{ backgroundColor: branch.color }"
              ></div>
              <span class="text-xs text-gray-700 dark:text-gray-300">{{
                branch.name
              }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 ml-1"
                >({{ branch.commitCount }})</span
              >
            </label>
          </div>
        </div>

        <!-- 時間範圍 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block"
          >
            時間範圍 ({{ formatDate(selectedTimeRange.start) }} -
            {{ formatDate(selectedTimeRange.end) }})
          </label>
          <div class="space-y-2">
            <input
              type="range"
              :min="0"
              :max="maxTimespan"
              :step="86400000"
              v-model="selectedTimeRange.start"
              class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="range"
              :min="selectedTimeRange.start"
              :max="maxTimespan"
              :step="86400000"
              v-model="selectedTimeRange.end"
              class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <!-- 播放控制 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block"
            >時間軸播放</label
          >
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <button
                @click="togglePlayback"
                class="px-2 py-1 text-xs rounded transition-colors"
                :class="
                  isPlaying
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                "
              >
                {{ isPlaying ? "⏸️ 暫停" : "▶️ 播放" }}
              </button>
              <button
                @click="resetPlayback"
                class="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                🔄 重置
              </button>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600 dark:text-gray-400">播放速度:</span>
              <select
                v-model="playbackSpeed"
                class="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700"
              >
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="2">2x</option>
                <option value="5">5x</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 視覺選項 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block"
            >視覺選項</label
          >
          <div class="space-y-2">
            <label
              v-for="option in visualOptions"
              :key="option.key"
              class="flex items-center"
            >
              <input
                type="checkbox"
                v-model="option.value"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-xs text-gray-700 dark:text-gray-300">{{
                option.label
              }}</span>
            </label>
          </div>
        </div>

        <!-- 佈局設置 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block"
            >佈局模式</label
          >
          <div class="grid grid-cols-2 gap-1">
            <button
              v-for="layout in layoutModes"
              :key="layout.id"
              @click="setLayoutMode(layout.id)"
              class="px-2 py-1 text-xs rounded transition-colors"
              :class="
                currentLayoutMode === layout.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              "
            >
              {{ layout.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 提交詳情面板 -->
    <div
      v-if="selectedCommit"
      class="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 w-80 max-h-96 overflow-y-auto"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
          提交詳情
        </h3>
        <button
          @click="selectedCommit = null"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <div class="text-sm font-medium text-gray-900 dark:text-white">
            {{ selectedCommit.message }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ selectedCommit.hash }}
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            :style="{ backgroundColor: selectedCommit.authorColor }"
          >
            {{ selectedCommit.author.charAt(0) }}
          </div>
          <div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ selectedCommit.author }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatDateTime(selectedCommit.timestamp) }}
            </div>
          </div>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">分支:</span>
            <span class="text-gray-900 dark:text-white">{{
              selectedCommit.branch
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">父提交:</span>
            <span class="text-gray-900 dark:text-white">{{
              selectedCommit.parents.length
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">子提交:</span>
            <span class="text-gray-900 dark:text-white">{{
              selectedCommit.children.length
            }}</span>
          </div>
        </div>

        <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            文件變更:
          </div>
          <div class="space-y-1 max-h-24 overflow-y-auto">
            <div
              v-for="change in selectedCommit.fileChanges"
              :key="change.file"
              class="text-xs flex items-center justify-between"
            >
              <span class="text-gray-900 dark:text-white">{{
                change.file
              }}</span>
              <span class="text-green-600 dark:text-green-400"
                >+{{ change.additions }}</span
              >
              <span class="text-red-600 dark:text-red-400"
                >-{{ change.deletions }}</span
              >
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            標籤:
          </div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="tag in selectedCommit.tags"
              :key="tag"
              class="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 統計面板 -->
    <div
      class="absolute bottom-4 left-4 z-10 bg-black/70 text-white text-xs p-3 rounded font-mono"
    >
      <div class="grid grid-cols-2 gap-x-4 gap-y-1">
        <div>FPS: {{ fps }}</div>
        <div>提交: {{ visibleCommits.length }}</div>
        <div>分支: {{ visibleBranches.length }}</div>
        <div>作者: {{ uniqueAuthors }}</div>
        <div>時間: {{ formatDateTime(currentPlaybackTime) }}</div>
        <div>Memory: {{ memoryUsage }}MB</div>
      </div>
    </div>

    <!-- Three.js 容器 -->
    <div
      ref="threeContainer"
      class="w-full h-full bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900"
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
        <p class="text-gray-700 dark:text-gray-300">載入版本演化樹...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import * as THREE from "three";
import { PerformanceOptimizer } from "@/utils/performanceOptimizer";

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  authorColor: string;
  timestamp: Date;
  branch: string;
  parents: string[];
  children: string[];
  tags: string[];
  fileChanges: Array<{
    file: string;
    additions: number;
    deletions: number;
  }>;
  position?: THREE.Vector3;
}

interface GitBranch {
  name: string;
  color: string;
  commitCount: number;
  isActive: boolean;
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
const selectedCommit = ref<GitCommit | null>(null);

// 控制狀態
const isPlaying = ref(false);
const playbackSpeed = ref(1);
const currentPlaybackTime = ref(Date.now());
const currentLayoutMode = ref("temporal");

// 時間控制
const maxTimespan = 30 * 24 * 60 * 60 * 1000; // 30天
const selectedTimeRange = ref({
  start: 0,
  end: maxTimespan,
});

// 視覺選項
const visualOptions = ref([
  { key: "showCommitMessages", label: "顯示提交訊息", value: true },
  { key: "showBranchNames", label: "顯示分支名稱", value: true },
  { key: "showMergeConnections", label: "顯示合併連接", value: true },
  { key: "animateGrowth", label: "動畫成長", value: true },
  { key: "showAuthorColors", label: "作者顏色", value: true },
]);

// 佈局模式
const layoutModes = [
  { id: "temporal", name: "時間軸" },
  { id: "hierarchical", name: "階層式" },
  { id: "radial", name: "放射狀" },
  { id: "force", name: "力導向" },
];

// 性能監控
const fps = ref(0);
const memoryUsage = ref(0);

// Three.js 對象
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let animationId: number;
let performanceOptimizer: PerformanceOptimizer;

// 數據
const branches = ref<GitBranch[]>([]);
const visibleBranches = ref<string[]>([]);
const commits = ref<GitCommit[]>([]);

// 場景對象
const commitNodes = new Map<string, THREE.Mesh>();
const branchLines = new Map<string, THREE.Line>();
const mergeConnections: THREE.Line[] = [];

// 計算屬性
const visibleCommits = computed(() => {
  return commits.value.filter(
    (commit) =>
      visibleBranches.value.includes(commit.branch) &&
      commit.timestamp.getTime() >= selectedTimeRange.value.start &&
      commit.timestamp.getTime() <= selectedTimeRange.value.end
  );
});

const uniqueAuthors = computed(() => {
  return new Set(visibleCommits.value.map((c) => c.author)).size;
});

// 初始化 Three.js 場景
const initThreeJS = () => {
  if (!threeContainer.value) return;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f0f1a);
  scene.fog = new THREE.Fog(0x0f0f1a, 100, 800);

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    threeContainer.value.clientWidth / threeContainer.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 50, 150);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(
    threeContainer.value.clientWidth,
    threeContainer.value.clientHeight
  );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;
  threeContainer.value.appendChild(renderer.domElement);

  setupControls();
  setupLighting();

  console.log("🌲 Git 版本演化樹場景初始化完成");
};

// 設置控制
const setupControls = () => {
  let isMouseDown = false;
  let previousMousePosition = { x: 0, y: 0 };
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

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
      Array.from(commitNodes.values())
    );

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const commitHash = mesh.userData.commitHash;
      const commit = commits.value.find((c) => c.hash === commitHash);
      if (commit) {
        selectedCommit.value = commit;
      }
    } else {
      selectedCommit.value = null;
    }
  });

  // 滾輪縮放
  renderer.domElement.addEventListener("wheel", (event) => {
    const scale = event.deltaY > 0 ? 1.1 : 0.9;
    camera.position.multiplyScalar(scale);
    camera.position.clampLength(20, 500);
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
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 100, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // 彩色補光
  const pointLight1 = new THREE.PointLight(0x4f46e5, 0.3, 200);
  pointLight1.position.set(-50, 50, 0);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x7c3aed, 0.3, 200);
  pointLight2.position.set(50, 50, 0);
  scene.add(pointLight2);
};

// 生成模擬 Git 數據
const generateMockGitData = () => {
  // 生成分支
  const branchNames = [
    "main",
    "develop",
    "feature/auth",
    "feature/ui",
    "hotfix/bug-123",
    "release/v1.0",
  ];
  const branchColors = [
    "#1f2937",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  branches.value = branchNames.map((name, index) => ({
    name,
    color: branchColors[index % branchColors.length],
    commitCount: Math.floor(Math.random() * 20) + 5,
    isActive: index < 4,
  }));

  visibleBranches.value = branches.value
    .filter((b) => b.isActive)
    .map((b) => b.name);

  // 生成提交
  const authors = [
    "Alice Chen",
    "Bob Wilson",
    "Carol Kim",
    "David Lee",
    "Emma Zhang",
  ];
  const authorColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const commitMessages = [
    "feat: 添加用戶認證功能",
    "fix: 修復登入頁面樣式問題",
    "refactor: 重構 API 服務層",
    "docs: 更新 README 文檔",
    "test: 添加單元測試",
    "style: 格式化代碼",
    "perf: 優化查詢性能",
    "chore: 更新依賴版本",
  ];

  const allCommits: GitCommit[] = [];
  let commitCounter = 0;

  // 為每個分支生成提交
  branches.value.forEach((branch) => {
    const commitCount = branch.commitCount;

    for (let i = 0; i < commitCount; i++) {
      const author = authors[Math.floor(Math.random() * authors.length)];
      const authorIndex = authors.indexOf(author);
      const timestamp = new Date(
        Date.now() -
          (commitCount - i) * 24 * 60 * 60 * 1000 +
          Math.random() * 12 * 60 * 60 * 1000
      );

      const commit: GitCommit = {
        hash: `${branch.name.replace(/[^a-zA-Z0-9]/g, "")}_${i.toString().padStart(3, "0")}_${Math.random().toString(36).substr(2, 6)}`,
        message:
          commitMessages[Math.floor(Math.random() * commitMessages.length)],
        author,
        authorColor: authorColors[authorIndex],
        timestamp,
        branch: branch.name,
        parents: i > 0 ? [`${branch.name}_${i - 1}`] : [],
        children: [],
        tags: Math.random() > 0.9 ? [`v1.${i}.0`] : [],
        fileChanges: Array.from(
          { length: Math.floor(Math.random() * 5) + 1 },
          (_, fileIndex) => ({
            file: `src/components/Component${fileIndex + 1}.vue`,
            additions: Math.floor(Math.random() * 50) + 1,
            deletions: Math.floor(Math.random() * 20),
          })
        ),
      };

      allCommits.push(commit);
      commitCounter++;
    }
  });

  // 建立父子關係
  allCommits.forEach((commit) => {
    commit.children = allCommits
      .filter((c) => c.parents.includes(commit.hash))
      .map((c) => c.hash);
  });

  // 添加一些跨分支的合併提交
  const mainCommits = allCommits.filter((c) => c.branch === "main");
  const featureCommits = allCommits.filter((c) =>
    c.branch.startsWith("feature/")
  );

  if (mainCommits.length > 0 && featureCommits.length > 0) {
    const mergeCommit: GitCommit = {
      hash: "merge_" + Math.random().toString(36).substr(2, 8),
      message: "Merge feature branch into main",
      author: "Alice Chen",
      authorColor: "#3b82f6",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      branch: "main",
      parents: [
        mainCommits[mainCommits.length - 1].hash,
        featureCommits[featureCommits.length - 1].hash,
      ],
      children: [],
      tags: [],
      fileChanges: [],
    };

    allCommits.push(mergeCommit);
  }

  commits.value = allCommits.sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  console.log(
    `🌲 生成 Git 數據: ${branches.value.length} 分支, ${commits.value.length} 提交`
  );
};

// 計算提交位置
const calculateCommitPositions = () => {
  const branchSpacing = 30;
  const commitSpacing = 20;
  const branchPositions = new Map<string, number>();

  // 為分支分配 X 位置
  visibleBranches.value.forEach((branchName, index) => {
    branchPositions.set(
      branchName,
      (index - visibleBranches.value.length / 2) * branchSpacing
    );
  });

  // 根據佈局模式計算位置
  visibleCommits.value.forEach((commit, index) => {
    const branchX = branchPositions.get(commit.branch) || 0;

    switch (currentLayoutMode.value) {
      case "temporal":
        // 時間軸佈局：Z軸表示時間
        const timeProgress =
          (commit.timestamp.getTime() - selectedTimeRange.value.start) /
          (selectedTimeRange.value.end - selectedTimeRange.value.start);
        commit.position = new THREE.Vector3(
          branchX,
          Math.random() * 10 - 5, // 輕微的Y軸偏移
          (timeProgress - 0.5) * 200
        );
        break;

      case "hierarchical":
        // 階層式佈局：Y軸表示深度
        commit.position = new THREE.Vector3(branchX, -index * 5, 0);
        break;

      case "radial":
        // 放射狀佈局
        const angle = (index / visibleCommits.value.length) * Math.PI * 2;
        const radius = 50 + commit.parents.length * 20;
        commit.position = new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        );
        break;

      case "force":
        // 力導向佈局（簡化版）
        commit.position = new THREE.Vector3(
          branchX + (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40
        );
        break;
    }
  });
};

// 創建提交節點
const createCommitNodes = () => {
  // 清除現有節點
  commitNodes.forEach((node) => scene.remove(node));
  commitNodes.clear();

  visibleCommits.value.forEach((commit) => {
    if (!commit.position) return;

    // 節點大小基於文件變更數量
    const changeCount = commit.fileChanges.reduce(
      (sum, change) => sum + change.additions + change.deletions,
      0
    );
    const nodeSize = Math.max(1, Math.min(4, changeCount / 10));

    const geometry = new THREE.SphereGeometry(nodeSize, 16, 12);
    const material = new THREE.MeshPhongMaterial({
      color: visualOptions.value.find((o) => o.key === "showAuthorColors")
        ?.value
        ? new THREE.Color(commit.authorColor)
        : new THREE.Color(
            branches.value.find((b) => b.name === commit.branch)?.color ||
              "#666666"
          ),
      emissive: new THREE.Color(commit.authorColor).multiplyScalar(0.1),
      shininess: 100,
    });

    const node = new THREE.Mesh(geometry, material);
    node.position.copy(commit.position);
    node.castShadow = true;
    node.userData = { commitHash: commit.hash, type: "commitNode" };

    scene.add(node);
    commitNodes.set(commit.hash, node);

    // 添加提交訊息標籤
    if (
      visualOptions.value.find((o) => o.key === "showCommitMessages")?.value
    ) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.width = 512;
      canvas.height = 64;
      context.fillStyle = "rgba(0, 0, 0, 0.8)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.font = "16px Arial";
      context.textAlign = "center";
      context.fillText(
        commit.message.length > 40
          ? commit.message.substring(0, 40) + "..."
          : commit.message,
        canvas.width / 2,
        canvas.height / 2 + 6
      );

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(commit.position);
      sprite.position.y += nodeSize + 5;
      sprite.scale.set(20, 2.5, 1);
      scene.add(sprite);
    }
  });
};

// 創建分支線
const createBranchLines = () => {
  // 清除現有線條
  branchLines.forEach((line) => scene.remove(line));
  branchLines.clear();
  mergeConnections.forEach((line) => scene.remove(line));
  mergeConnections.length = 0;

  // 為每個分支創建連接線
  visibleBranches.value.forEach((branchName) => {
    const branchCommits = visibleCommits.value
      .filter((c) => c.branch === branchName)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (branchCommits.length < 2) return;

    const points = branchCommits.map((c) => c.position!);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const branch = branches.value.find((b) => b.name === branchName);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(branch?.color || "#666666"),
      transparent: true,
      opacity: 0.6,
      linewidth: 2,
    });

    const line = new THREE.Line(geometry, material);
    scene.add(line);
    branchLines.set(branchName, line);
  });

  // 創建合併連接線
  if (
    visualOptions.value.find((o) => o.key === "showMergeConnections")?.value
  ) {
    visibleCommits.value.forEach((commit) => {
      if (commit.parents.length > 1) {
        // 這是一個合併提交
        commit.parents.forEach((parentHash) => {
          const parentCommit = commits.value.find((c) => c.hash === parentHash);
          if (parentCommit && parentCommit.position && commit.position) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
              parentCommit.position,
              commit.position,
            ]);

            const material = new THREE.LineBasicMaterial({
              color: 0xffaa00,
              transparent: true,
              opacity: 0.8,
              linewidth: 3,
            });

            const line = new THREE.Line(geometry, material);
            scene.add(line);
            mergeConnections.push(line);
          }
        });
      }
    });
  }
};

// 控制方法
const toggleBranch = (branchName: string) => {
  const index = visibleBranches.value.indexOf(branchName);
  if (index > -1) {
    visibleBranches.value.splice(index, 1);
  } else {
    visibleBranches.value.push(branchName);
  }
};

const setLayoutMode = (mode: string) => {
  currentLayoutMode.value = mode;
  calculateCommitPositions();
  createCommitNodes();
  createBranchLines();
};

const togglePlayback = () => {
  isPlaying.value = !isPlaying.value;
};

const resetPlayback = () => {
  currentPlaybackTime.value = selectedTimeRange.value.start;
  isPlaying.value = false;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("zh-TW");
};

const formatDateTime = (timestamp: number | Date) => {
  const date = typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  return date.toLocaleString("zh-TW");
};

// 動畫循環
const animate = () => {
  animationId = requestAnimationFrame(animate);

  // 性能監控
  fps.value = Math.round(
    1000 / (performance.now() - (window as any).lastFrameTime || 0)
  );
  (window as any).lastFrameTime = performance.now();
  memoryUsage.value =
    Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024) || 0;

  // 播放動畫
  if (isPlaying.value) {
    currentPlaybackTime.value += 60000 * playbackSpeed.value; // 根據播放速度前進
    if (currentPlaybackTime.value > selectedTimeRange.value.end) {
      currentPlaybackTime.value = selectedTimeRange.value.start;
    }
  }

  // 節點動畫
  if (visualOptions.value.find((o) => o.key === "animateGrowth")?.value) {
    const time = Date.now() * 0.001;
    commitNodes.forEach((node, hash) => {
      const commit = commits.value.find((c) => c.hash === hash);
      if (commit && currentPlaybackTime.value >= commit.timestamp.getTime()) {
        node.scale.setScalar(1 + Math.sin(time + hash.charCodeAt(0)) * 0.1);
      }
    });
  }

  renderer.render(scene, camera);
};

// 監聽器
watch(
  [visibleCommits, currentLayoutMode],
  () => {
    calculateCommitPositions();
    createCommitNodes();
    createBranchLines();
  },
  { deep: true }
);

watch(
  visualOptions,
  () => {
    createCommitNodes();
    createBranchLines();
  },
  { deep: true }
);

// 生命週期
onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  generateMockGitData();
  initThreeJS();
  calculateCommitPositions();
  createCommitNodes();
  createBranchLines();
  animate();

  isLoading.value = false;
  console.log("🌟 Git 版本演化樹已載入完成");
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  if (renderer) {
    renderer.dispose();
  }
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
