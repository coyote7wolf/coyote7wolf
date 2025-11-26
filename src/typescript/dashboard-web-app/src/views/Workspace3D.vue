<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ $t("workspace3d.title") }}
    </h1>

    <!-- 控制面板 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
    >
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >{{ $t("workspace3d.controls") }}:</label
          >
          <select
            v-model="viewMode"
            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="orbit">
              {{ $t("workspace3d.viewModes.orbit") }}
            </option>
            <option value="first-person">
              {{ $t("workspace3d.viewModes.firstPerson") }}
            </option>
            <option value="top-down">
              {{ $t("workspace3d.viewModes.topDown") }}
            </option>
          </select>
        </div>
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >{{ $t("workspace3d.userTrajectories") }}:</label
          >
          <input type="checkbox" v-model="showTrajectories" class="rounded" />
        </div>
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >{{ $t("workspace3d.showLabels") }}:</label
          >
          <input type="checkbox" v-model="showLabels" class="rounded" />
        </div>
        <button
          @click="resetCamera"
          class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {{ $t("workspace3d.reset") }}
        </button>
      </div>
    </div>

    <!-- 3D 場景容器 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {{ $t("workspace3d.subtitle") }}
      </h2>

      <div
        ref="threeContainer"
        class="bg-gray-100 dark:bg-gray-900 rounded-lg h-96 w-full overflow-hidden"
      >
        <!-- Three.js 渲染區域 -->
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          功能預覽
        </h3>
        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li>• 多用戶協作軌跡立體追蹤</li>
          <li>• Git-like 版本演化樹視覺化</li>
          <li>• 協作熱點 3D 熱力圖</li>
          <li>• WebXR VR 準備介面</li>
          <li>• 互動式 3D 導航控制</li>
        </ul>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          技術亮點
        </h3>
        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li>• Three.js WebGL 渲染</li>
          <li>• LOD (Level of Detail) 效能最佳化</li>
          <li>• WebWorker 背景運算</li>
          <li>• 視錐剔除技術</li>
          <li>• 觸控手勢支援</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

// 響應式變數
const threeContainer = ref<HTMLDivElement>();
const viewMode = ref("orbit");
const showTrajectories = ref(true);
const showLabels = ref(true);

// Three.js 變數
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let animationId: number;

// 初始化 Three.js 場景
const initThreeJS = () => {
  if (!threeContainer.value) return;

  // 場景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  // 相機
  camera = new THREE.PerspectiveCamera(
    75,
    threeContainer.value.clientWidth / threeContainer.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(20, 20, 20);
  camera.lookAt(0, 0, 0);

  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(
    threeContainer.value.clientWidth,
    threeContainer.value.clientHeight
  );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  threeContainer.value.appendChild(renderer.domElement);

  // 光照
  setupLighting();

  // 創建協作空間
  createWorkspace();

  // 創建示例用戶
  createUsers();

  // 開始渲染循環
  animate();

  // 事件監聽
  setupControls();
  window.addEventListener("resize", onWindowResize);
};

// 設置光照
const setupLighting = () => {
  // 環境光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);

  // 主光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // 點光源
  const pointLight = new THREE.PointLight(0x00ff88, 0.5, 100);
  pointLight.position.set(0, 20, 0);
  scene.add(pointLight);
};

// 創建工作空間
const createWorkspace = () => {
  // 地面
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // 網格
  const gridHelper = new THREE.GridHelper(100, 20, 0x666666, 0x444444);
  scene.add(gridHelper);

  // 工作區域
  const areas = [
    { name: "Frontend", pos: [-20, 0, -20], color: 0x3b82f6 },
    { name: "Backend", pos: [20, 0, -20], color: 0x10b981 },
    { name: "Database", pos: [-20, 0, 20], color: 0xf59e0b },
    { name: "DevOps", pos: [20, 0, 20], color: 0x8b5cf6 },
  ];

  areas.forEach((area) => {
    // 區域平台
    const platformGeometry = new THREE.BoxGeometry(15, 1, 15);
    const platformMaterial = new THREE.MeshLambertMaterial({
      color: area.color,
      transparent: true,
      opacity: 0.7,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(area.pos[0], area.pos[1] + 0.5, area.pos[2]);
    platform.castShadow = true;
    platform.receiveShadow = true;
    scene.add(platform);

    // 標籤
    if (showLabels.value) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.width = 512;
      canvas.height = 128;
      context.fillStyle = `#${area.color.toString(16).padStart(6, "0")}`;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.font = "bold 48px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(area.name, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(area.pos[0], 10, area.pos[2]);
      sprite.scale.set(20, 5, 1);
      scene.add(sprite);
    }
  });
};

// 創建示例用戶
const createUsers = () => {
  const users = [
    { name: "Alice", pos: [-15, 2, -15], color: 0xff6b6b },
    { name: "Bob", pos: [15, 2, -15], color: 0x4ecdc4 },
    { name: "Carol", pos: [-15, 2, 15], color: 0x45b7d1 },
    { name: "David", pos: [15, 2, 15], color: 0xfeca57 },
  ];

  users.forEach((user) => {
    // 用戶頭像 (球體)
    const avatarGeometry = new THREE.SphereGeometry(1, 16, 16);
    const avatarMaterial = new THREE.MeshLambertMaterial({ color: user.color });
    const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
    avatar.position.set(user.pos[0], user.pos[1], user.pos[2]);
    avatar.castShadow = true;
    scene.add(avatar);

    // 用戶名標籤
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = "rgba(0,0,0,0.8)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.font = "bold 32px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(user.name, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(user.pos[0], user.pos[1] + 3, user.pos[2]);
    sprite.scale.set(8, 2, 1);
    scene.add(sprite);

    // 協作軌跡
    if (showTrajectories.value) {
      const points = [];
      for (let i = 0; i < 50; i++) {
        const t = i / 49;
        const x = user.pos[0] + Math.sin(t * Math.PI * 4) * 5;
        const y = user.pos[1] + Math.sin(t * Math.PI * 8) * 2;
        const z = user.pos[2] + Math.cos(t * Math.PI * 4) * 5;
        points.push(new THREE.Vector3(x, y, z));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: user.color,
        transparent: true,
        opacity: 0.6,
      });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    }
  });
};

// 設置控制
const setupControls = () => {
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  renderer.domElement.addEventListener("mousedown", (event) => {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
  });

  renderer.domElement.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    };

    const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(deltaMove.y * 0.01, deltaMove.x * 0.01, 0, "XYZ")
    );

    camera.quaternion.multiplyQuaternions(
      deltaRotationQuaternion,
      camera.quaternion
    );
    previousMousePosition = { x: event.clientX, y: event.clientY };
  });

  renderer.domElement.addEventListener("mouseup", () => {
    isDragging = false;
  });

  renderer.domElement.addEventListener("wheel", (event) => {
    const scale = event.deltaY > 0 ? 1.1 : 0.9;
    camera.position.multiplyScalar(scale);
    camera.position.clampLength(5, 100);
  });
};

// 渲染循環
const animate = () => {
  animationId = requestAnimationFrame(animate);

  // 旋轉相機 (自動模式)
  if (viewMode.value === "orbit") {
    const time = Date.now() * 0.0005;
    camera.position.x = Math.cos(time) * 30;
    camera.position.z = Math.sin(time) * 30;
    camera.lookAt(0, 0, 0);
  }

  renderer.render(scene, camera);
};

// 重置相機
const resetCamera = () => {
  camera.position.set(20, 20, 20);
  camera.lookAt(0, 0, 0);
};

// 視窗大小調整
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

// 生命週期
onMounted(() => {
  initThreeJS();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (renderer) {
    renderer.dispose();
  }
  window.removeEventListener("resize", onWindowResize);
});
</script>
