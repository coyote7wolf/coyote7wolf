<template>
  <div class="relative inline-block text-left">
    <div>
      <button
        @click="toggle"
        type="button"
        class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none"
        id="menu-button"
        aria-expanded="true"
        aria-haspopup="true"
      >
        <slot>Dropdown</slot>
        <BaseIcon icon="chevron-down" class="ml-2" />
      </button>
    </div>
    <transition name="fade">
      <div
        v-if="open"
        class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
      >
        <div class="py-1">
          <slot name="menu"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import BaseIcon from './BaseIcon.vue'

export default {
  name: 'BaseDropdown',
  components: { BaseIcon },
  data() {
    return {
      open: false,
    }
  },
  methods: {
    toggle() {
      this.open = !this.open
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
