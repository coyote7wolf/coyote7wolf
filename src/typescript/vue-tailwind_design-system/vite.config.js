import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/components/index.js',
      name: 'VueDesignSystem',
      fileName: (format) => `vue-design-system.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    includeSource: ['src/**/*.{js,ts,vue}'],
  },
})
