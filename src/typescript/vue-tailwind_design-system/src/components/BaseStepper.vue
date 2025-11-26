<template>
  <div class="flex items-center">
    <div v-for="(step, i) in steps" :key="i" class="flex items-center">
      <div :class="stepClass(i)">
        <span v-if="i < current" class="text-green-500"><BaseIcon icon="check" /></span>
        <span v-else>{{ i + 1 }}</span>
      </div>
      <div v-if="i < steps.length - 1" class="flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700"></div>
    </div>
  </div>
  <div class="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-300">
    <span v-for="(step, i) in steps" :key="i">{{ step }}</span>
  </div>
</template>

<script>
import BaseIcon from './BaseIcon.vue'

export default {
  name: 'BaseStepper',
  components: { BaseIcon },
  props: {
    steps: {
      type: Array,
      required: true, // [step1, step2, ...]
    },
    current: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    stepClass(i) {
      return [
        'w-8 h-8 flex items-center justify-center rounded-full border-2',
        i < this.current
          ? 'border-green-500 bg-green-100 dark:bg-green-900'
          : i === this.current
          ? 'border-blue-500 bg-blue-100 dark:bg-blue-900'
          : 'border-gray-300 bg-white dark:bg-gray-800',
        'text-lg font-bold',
      ]
    },
  },
}
</script>
