<template>
  <span class="relative group">
    <slot />
    <span
      class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10"
    >
      {{ text }}
    </span>
  </span>
</template>
<script setup>
defineProps({ text: String })
</script>
