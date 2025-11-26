<template>
  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
    <div
      class="h-2 rounded-full transition-all duration-300"
      :class="barClass"
      :style="{ width: percent + '%' }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'BaseProgress',
  props: {
    percent: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      default: 'blue', // blue, green, red, etc.
    },
  },
  computed: {
    barClass() {
      return (
        {
          blue: 'bg-blue-500',
          green: 'bg-green-500',
          red: 'bg-red-500',
          yellow: 'bg-yellow-500',
          gray: 'bg-gray-500',
        }[this.color] || 'bg-blue-500'
      )
    },
  },
}
</script>
