<template>
  <select
    class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
    v-bind="$attrs"
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <slot />
  </select>
</template>
<script setup>
defineProps({ modelValue: String })
</script>
