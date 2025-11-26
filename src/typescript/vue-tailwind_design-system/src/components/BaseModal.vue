<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
  >
    <div class="bg-white rounded shadow-lg p-6 min-w-[300px] relative">
      <button
        class="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
        @click="$emit('update:modelValue', false)"
      >
        &times;
      </button>
      <slot />
    </div>
  </div>
</template>
<script setup>
defineProps({ modelValue: Boolean })
</script>
