import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@/components": resolve(__dirname, "src/components"),
      "@/views": resolve(__dirname, "src/views"),
      "@/stores": resolve(__dirname, "src/stores"),
      "@/utils": resolve(__dirname, "src/utils"),
      "@/types": resolve(__dirname, "src/types"),
      "@/mocks": resolve(__dirname, "src/mocks"),
      "@/assets": resolve(__dirname, "src/assets"),
    },
  },
  server: {
    port: 3702,
    host: true,
    cors: true,
  },
  preview: {
    port: 3702,
    host: true,
  },
  build: {
    target: "esnext",
    sourcemap: process.env.NODE_ENV === "development",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // 程式碼分割策略
        manualChunks: {
          // 核心框架
          "vue-core": ["vue", "vue-router", "pinia"],

          // 3D 可視化庫
          visualization: ["d3", "three"],

          // 圖表庫
          charts: ["chart.js", "vue-chartjs"],

          // 工具庫
          utils: ["axios", "dayjs", "@vueuse/core"],

          // UI 組件
          "ui-components": [
            "./src/components/ui/VirtualScroll.vue",
            "./src/components/charts/CollaborationHeatmap.vue",
            "./src/components/charts/ConflictPieChart.vue",
          ],

          // 3D 組件
          "3d-components": [
            "./src/components/3d/ContextFlow3D.vue",
            "./src/components/3d/CollaborationTrajectory3D.vue",
            "./src/components/3d/GitEvolutionTree3D.vue",
          ],

          // PWA 和性能工具
          performance: [
            "./src/utils/performanceOptimizer.ts",
            "./src/utils/webWorkerManager.ts",
            "./src/utils/progressiveLoadingManager.ts",
            "./src/utils/pwaManager.ts",
          ],
        },

        // 資源檔案命名
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split(".");
          const ext = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(assetInfo.name!)) {
            return `assets/media/[name]-[hash].${ext}`;
          } else if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name!)) {
            return `assets/images/[name]-[hash].${ext}`;
          } else if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name!)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          return `assets/[ext]/[name]-[hash].${ext}`;
        },
      },

      // 外部依賴（如果需要 CDN）
      external: process.env.NODE_ENV === "production" ? [] : [],
    },

    // 資源內聯限制
    assetsInlineLimit: 4096,

    // Chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
  },
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  },
});
