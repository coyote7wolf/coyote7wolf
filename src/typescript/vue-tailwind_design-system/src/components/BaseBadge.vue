<template>
  <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold" :class="colorClass">
    <slot />
  </span>
</template>
<script setup>
const props = defineProps({
  color: { type: String, default: 'gray' },
})
const colorClass =
  {
    gray: 'bg-gray-200 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  }[props.color] || 'bg-gray-200 text-gray-800'
</script>
