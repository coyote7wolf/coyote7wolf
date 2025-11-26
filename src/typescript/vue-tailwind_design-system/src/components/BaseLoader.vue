<template>
  <span
    class="inline-block animate-spin text-gray-500 dark:text-gray-300"
    :class="sizeClass"
    aria-label="Loading"
  >
    <svg class="block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  </span>
</template>

<script>
export default {
  name: 'BaseLoader',
  props: {
    size: { type: String, default: 'md' }, // sm, md, lg
  },
  computed: {
    sizeClass() {
      return (
        {
          sm: 'w-4 h-4',
          md: 'w-6 h-6',
          lg: 'w-8 h-8',
        }[this.size] || 'w-6 h-6'
      )
    },
  },
}
</script>
