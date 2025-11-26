<template>
  <img
    :src="src"
    :alt="alt"
    class="inline-block w-10 h-10 rounded-full object-cover border border-gray-200"
  />
</template>
<script setup>
defineProps({ src: String, alt: String })
</script>
