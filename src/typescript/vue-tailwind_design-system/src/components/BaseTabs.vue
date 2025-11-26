<template>
  <div>
    <div class="flex border-b">
      <button
        v-for="(tab, i) in tabs"
        :key="i"
        class="px-4 py-2 -mb-px border-b-2"
        :class="i === active ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'"
        @click="$emit('update:active', i)"
      >
        {{ tab }}
      </button>
    </div>
    <div class="p-4">
      <slot :active="active" />
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  tabs: { type: Array, required: true },
  active: { type: Number, default: 0 },
})
</script>
