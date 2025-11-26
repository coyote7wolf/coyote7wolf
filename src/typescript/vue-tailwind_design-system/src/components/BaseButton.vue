<template>
  <button
    :class="[baseClass, colorClass, darkClass, $attrs.class]"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    color: {
      type: String,
      default: 'primary', // primary, secondary, danger, etc.
    },
  },
  computed: {
    baseClass() {
      return 'font-semibold py-2 px-4 rounded transition'
    },
    colorClass() {
      switch (this.color) {
        case 'primary':
          return 'bg-blue-600 hover:bg-blue-700 text-white'
        case 'secondary':
          return 'bg-gray-200 hover:bg-gray-300 text-gray-900'
        case 'danger':
          return 'bg-red-600 hover:bg-red-700 text-white'
        default:
          return 'bg-blue-600 hover:bg-blue-700 text-white'
      }
    },
    darkClass() {
      switch (this.color) {
        case 'primary':
          return 'dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white'
        case 'secondary':
          return 'dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100'
        case 'danger':
          return 'dark:bg-red-500 dark:hover:bg-red-600 dark:text-white'
        default:
          return 'dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white'
      }
    },
  },
  emits: ['click'],
}
</script>
