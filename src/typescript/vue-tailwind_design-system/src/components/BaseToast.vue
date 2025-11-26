<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <transition-group name="toast-fade" tag="div">
      <div
        v-for="(toast, i) in toasts"
        :key="toast.id"
        :class="toastClass(toast.type)"
        class="flex items-center px-4 py-2 rounded shadow-lg"
      >
        <BaseIcon v-if="toast.icon" :icon="toast.icon" class="mr-2" />
        <span>{{ toast.message }}</span>
        <button
          class="ml-4 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-white"
          @click="remove(i)"
        >
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import BaseIcon from './BaseIcon.vue'

export default {
  name: 'BaseToast',
  components: { BaseIcon },
  data() {
    return {
      toasts: [],
    }
  },
  methods: {
    show({ message, type = 'info', icon = null, duration = 3000 }) {
      const id = Date.now() + Math.random()
      this.toasts.push({ id, message, type, icon })
      setTimeout(() => this.removeById(id), duration)
    },
    remove(i) {
      this.toasts.splice(i, 1)
    },
    removeById(id) {
      const idx = this.toasts.findIndex((t) => t.id === id)
      if (idx !== -1) this.remove(idx)
    },
    toastClass(type) {
      return (
        {
          info: 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
          success: 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100',
          error: 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100',
          warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
        }[type] || 'bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
      )
    },
  },
}
</script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}
</style>
