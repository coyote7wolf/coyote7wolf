<template>
  <div class="p-4 rounded text-white" :class="typeClass">
    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (v) => ['info', 'success', 'warning', 'error'].includes(v),
  },
})

const typeClass =
  {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  }[props.type] || 'bg-blue-500'
</script>
