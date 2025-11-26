<template>
  <nav class="flex items-center space-x-1">
    <button
      class="px-2 py-1 rounded hover:bg-gray-200"
      :disabled="page === 1"
      @click="$emit('update:page', page - 1)"
    >
      &lt;
    </button>
    <span class="px-2">{{ page }}</span>
    <button class="px-2 py-1 rounded hover:bg-gray-200" @click="$emit('update:page', page + 1)">
      &gt;
    </button>
  </nav>
</template>
<script setup>
defineProps({ page: { type: Number, default: 1 } })
</script>
