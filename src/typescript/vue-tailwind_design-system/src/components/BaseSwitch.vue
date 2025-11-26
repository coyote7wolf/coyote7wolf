<template>
  <label class="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      class="sr-only peer"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <div class="w-10 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition relative">
      <div
        class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-4"
      ></div>
    </div>
    <span class="ml-2"><slot /></span>
  </label>
</template>
<script setup>
defineProps({ modelValue: Boolean })
</script>
