<template>
  <div class="w-full h-full relative" ref="containerRef">
    <!-- 控制面板 -->
    <div
      class="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        3D Context Flow 控制
      </h3>

      <div class="space-y-3">
        <!-- 視角控制 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block"
            >視角</label
          >
          <div class="flex space-x-2">
            <button
              v-for="view in viewPresets"
              :key="view.name"
              @click="setView(view)"
              class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              :class="{
                'bg-blue-200 dark:bg-blue-900/50': currentView === view.name,
              }"
            >
              {{ view.name }}
            </button>
          </div>
        </div>

        <!-- 節點類型篩選 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block"
            >節點類型</label
          >
          <div class="space-y-1">
            <label
              v-for="type in nodeTypes"
              :key="type"
              class="flex items-center"
            >
              <input
                type="checkbox"
                :checked="visibleTypes.includes(type)"
                @change="toggleNodeType(type)"
                class="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-xs text-gray-700 dark:text-gray-300">{{
                type
              }}</span>
            </label>
          </div>
        </div>

        <!-- 連接強度 -->
        <div>
          <label
            class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block"
          >
            連接強度 ({{ connectionThreshold.toFixed(2) }})
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            v-model="connectionThreshold"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <!-- 動畫控制 -->
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-700 dark:text-gray-300"
            >自動旋轉</span
          >
          <button
            @click="toggleAutoRotate"
            class="px-2 py-1 text-xs rounded transition-colors"
            :class="
              autoRotate
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            "
          >
            {{ autoRotate ? "ON" : "OFF" }}
          </button>
        </div>
      </div>
    </div>

    <!-- 節點資訊面板 -->
    <div
      v-if="selectedNode"
      class="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 w-80"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
          節點詳情
        </h3>
        <button
          @click="selectedNode = null"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">ID:</span>
          <span class="text-gray-900 dark:text-white font-mono">{{
            selectedNode.id
          }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">類型:</span>
          <span
            class="px-2 py-1 text-xs rounded-full"
            :class="getTypeColor(selectedNode.type)"
          >
            {{ selectedNode.type }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">標籤:</span>
          <span class="text-gray-900 dark:text-white">{{
            selectedNode.label
          }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">語意分數:</span>
          <span class="text-gray-900 dark:text-white">{{
            selectedNode.semanticScore.toFixed(3)
          }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">連接數:</span>
          <span class="text-gray-900 dark:text-white">{{
            selectedNode.connections.length
          }}</span>
        </div>

        <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
          <span class="text-gray-600 dark:text-gray-400 text-xs">連接到:</span>
          <div class="mt-1 space-y-1 max-h-32 overflow-y-auto">
            <div
              v-for="connectionId in selectedNode.connections.slice(0, 10)"
              :key="connectionId"
              class="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
              @click="focusOnNode(connectionId)"
            >
              {{ connectionId }}
            </div>
            <div
              v-if="selectedNode.connections.length > 10"
              class="text-xs text-gray-500"
            >
              ... 還有 {{ selectedNode.connections.length - 10 }} 個連接
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Three.js 容器 -->
    <div
      ref="threeContainer"
      class="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    ></div>

    <!-- Loading 狀態 -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-700 dark:text-gray-300">載入 3D 場景中...</p>
      </div>
    </div>

    <!-- 性能統計 -->
    <div
      class="absolute bottom-4 left-4 z-10 bg-black bg-opacity-70 text-white text-xs p-2 rounded font-mono"
    >
      <div>FPS: {{ fps }}</div>
      <div>節點: {{ nodeCount }}</div>
      <div>連接: {{ connectionCount }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import * as THREE from "three";
import type { ContextFlowNode } from "@/stores/types";

// Props
interface Props {
  data?: {
    nodes: ContextFlowNode[];
  };
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({ nodes: [] }),
  width: 800,
  height: 600,
});

// Refs
const containerRef = ref<HTMLElement>();
const threeContainer = ref<HTMLElement>();
const isLoading = ref(true);
const selectedNode = ref<ContextFlowNode | null>(null);
const currentView = ref("默認");
const autoRotate = ref(true);
const connectionThreshold = ref(0.3);
const visibleTypes = ref([
  "document",
  "code",
  "discussion",
  "task",
  "decision",
]);

// Performance monitoring
const fps = ref(0);
const nodeCount = computed(() => props.data.nodes.length);
const connectionCount = computed(() => {
  return props.data.nodes.reduce(
    (sum, node) => sum + node.connections.length,
    0
  );
});

// Three.js objects
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: any;
let animationId: number;

// Node and connection objects
const nodeObjects = new Map<string, THREE.Mesh>();
const connectionObjects: THREE.Line[] = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Constants
const nodeTypes = ["document", "code", "discussion", "task", "decision"];
const viewPresets = [
  { name: "默認", position: { x: 0, y: 0, z: 500 } },
  { name: "俯視", position: { x: 0, y: 800, z: 0 } },
  { name: "側視", position: { x: 800, y: 0, z: 0 } },
  { name: "遠景", position: { x: 300, y: 300, z: 800 } },
];

// 節點類型顏色映射
const typeColors = {
  document: 0x3b82f6, // blue
  code: 0x10b981, // green
  discussion: 0xf59e0b, // yellow
  task: 0xef4444, // red
  decision: 0x8b5cf6, // purple
};

const getTypeColor = (type: string) => {
  const colorMap = {
    document:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    code: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
    discussion:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    task: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    decision:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
  };
  return colorMap[type as keyof typeof colorMap] || "bg-gray-100 text-gray-800";
};

// 初始化 Three.js 場景
const initThreeJS = () => {
  if (!threeContainer.value) return;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8fafc);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    threeContainer.value.clientWidth / threeContainer.value.clientHeight,
    0.1,
    2000
  );
  camera.position.set(0, 0, 500);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(
    threeContainer.value.clientWidth,
    threeContainer.value.clientHeight
  );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  threeContainer.value.appendChild(renderer.domElement);

  // Controls (假設使用 OrbitControls)
  // 這裡需要導入 OrbitControls，簡化版本的控制
  setupBasicControls();

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(100, 100, 50);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // 事件監聽
  renderer.domElement.addEventListener("click", onCanvasClick);
  renderer.domElement.addEventListener("mousemove", onCanvasMouseMove);
  window.addEventListener("resize", onWindowResize);

  console.log("🎮 Three.js 場景初始化完成");
};

// 簡化的控制設置
const setupBasicControls = () => {
  let isMouseDown = false;
  let previousMousePosition = { x: 0, y: 0 };

  renderer.domElement.addEventListener("mousedown", (event) => {
    isMouseDown = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
  });

  renderer.domElement.addEventListener("mouseup", () => {
    isMouseDown = false;
  });

  renderer.domElement.addEventListener("mousemove", (event) => {
    if (!isMouseDown) return;

    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    };

    // 旋轉相機
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(camera.position);
    spherical.theta -= deltaMove.x * 0.01;
    spherical.phi += deltaMove.y * 0.01;
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

    camera.position.setFromSpherical(spherical);
    camera.lookAt(scene.position);

    previousMousePosition = { x: event.clientX, y: event.clientY };
  });

  // 滾輪縮放
  renderer.domElement.addEventListener("wheel", (event) => {
    const scale = event.deltaY > 0 ? 1.1 : 0.9;
    camera.position.multiplyScalar(scale);
    camera.position.clampLength(50, 1500);
  });
};

// 創建節點
const createNodes = () => {
  // 清除現有節點
  nodeObjects.forEach((obj) => scene.remove(obj));
  nodeObjects.clear();

  props.data.nodes.forEach((node) => {
    if (!visibleTypes.value.includes(node.type)) return;

    const geometry = new THREE.SphereGeometry(5, 16, 12);
    const material = new THREE.MeshPhongMaterial({
      color: typeColors[node.type as keyof typeof typeColors] || 0x666666,
      transparent: true,
      opacity: 0.8,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(node.position.x, node.position.y, node.position.z);
    mesh.userData = { nodeData: node };

    // 添加文字標籤
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.font = "16px Arial";
    context.textAlign = "center";
    context.fillText(node.label, canvas.width / 2, canvas.height / 2 + 6);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(node.position.x, node.position.y + 15, node.position.z);
    sprite.scale.set(30, 7.5, 1);

    scene.add(mesh);
    scene.add(sprite);
    nodeObjects.set(node.id, mesh);
  });
};

// 創建連接線
const createConnections = () => {
  // 清除現有連接
  connectionObjects.forEach((line) => scene.remove(line));
  connectionObjects.length = 0;

  props.data.nodes.forEach((node) => {
    if (!visibleTypes.value.includes(node.type)) return;

    node.connections.forEach((connectionId) => {
      const targetNode = props.data.nodes.find((n) => n.id === connectionId);
      if (!targetNode || !visibleTypes.value.includes(targetNode.type)) return;

      // 計算連接強度 (基於語意分數)
      const strength = (node.semanticScore + targetNode.semanticScore) / 2;
      if (strength < connectionThreshold.value) return;

      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(node.position.x, node.position.y, node.position.z),
        new THREE.Vector3(
          targetNode.position.x,
          targetNode.position.y,
          targetNode.position.z
        ),
      ]);

      const material = new THREE.LineBasicMaterial({
        color: 0x64748b,
        transparent: true,
        opacity: strength * 0.6,
      });

      const line = new THREE.Line(geometry, material);
      scene.add(line);
      connectionObjects.push(line);
    });
  });
};

// 事件處理
const onCanvasClick = (event: MouseEvent) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(
    Array.from(nodeObjects.values())
  );

  if (intersects.length > 0) {
    const mesh = intersects[0].object as THREE.Mesh;
    selectedNode.value = mesh.userData.nodeData;
    console.log("選中節點:", selectedNode.value);
  } else {
    selectedNode.value = null;
  }
};

const onCanvasMouseMove = (event: MouseEvent) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(
    Array.from(nodeObjects.values())
  );

  // 改變懸停樣式
  nodeObjects.forEach((mesh) => {
    (mesh.material as THREE.MeshPhongMaterial).emissive.setHex(0x000000);
  });

  if (intersects.length > 0) {
    const mesh = intersects[0].object as THREE.Mesh;
    (mesh.material as THREE.MeshPhongMaterial).emissive.setHex(0x333333);
  }
};

const onWindowResize = () => {
  if (!threeContainer.value) return;

  camera.aspect =
    threeContainer.value.clientWidth / threeContainer.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
    threeContainer.value.clientWidth,
    threeContainer.value.clientHeight
  );
};

// 控制方法
const setView = (view: any) => {
  currentView.value = view.name;
  camera.position.set(view.position.x, view.position.y, view.position.z);
  camera.lookAt(scene.position);
};

const toggleNodeType = (type: string) => {
  const index = visibleTypes.value.indexOf(type);
  if (index > -1) {
    visibleTypes.value.splice(index, 1);
  } else {
    visibleTypes.value.push(type);
  }
};

const toggleAutoRotate = () => {
  autoRotate.value = !autoRotate.value;
};

const focusOnNode = (nodeId: string) => {
  const node = props.data.nodes.find((n) => n.id === nodeId);
  if (node) {
    camera.position.set(
      node.position.x + 100,
      node.position.y + 100,
      node.position.z + 100
    );
    camera.lookAt(node.position.x, node.position.y, node.position.z);
    selectedNode.value = node;
  }
};

// 動畫循環
const animate = () => {
  animationId = requestAnimationFrame(animate);

  // 自動旋轉
  if (autoRotate.value) {
    const time = Date.now() * 0.0005;
    camera.position.x = Math.cos(time) * 500;
    camera.position.z = Math.sin(time) * 500;
    camera.lookAt(scene.position);
  }

  // FPS 計算
  fps.value = Math.round(
    1000 / (performance.now() - (window as any).lastFrameTime || 0)
  );
  (window as any).lastFrameTime = performance.now();

  renderer.render(scene, camera);
};

// 監聽器
watch(
  () => props.data,
  () => {
    createNodes();
    createConnections();
  },
  { deep: true }
);

watch(
  [visibleTypes, connectionThreshold],
  () => {
    createNodes();
    createConnections();
  },
  { deep: true }
);

// 生命週期
onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500)); // 模擬載入
  initThreeJS();
  createNodes();
  createConnections();
  animate();
  isLoading.value = false;
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  if (renderer) {
    renderer.domElement.removeEventListener("click", onCanvasClick);
    renderer.domElement.removeEventListener("mousemove", onCanvasMouseMove);
    renderer.dispose();
  }

  window.removeEventListener("resize", onWindowResize);
});
</script>

<style scoped>
/* 自定義滾動條 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
