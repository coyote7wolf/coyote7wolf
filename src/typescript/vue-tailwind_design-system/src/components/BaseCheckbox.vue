<template>
  <label class="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      class="form-checkbox h-4 w-4 text-blue-600"
      v-bind="$attrs"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="ml-2"><slot /></span>
  </label>
</template>
<script setup>
defineProps({ modelValue: Boolean })
</script>
