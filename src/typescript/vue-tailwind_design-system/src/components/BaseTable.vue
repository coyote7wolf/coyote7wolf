<template>
  <table class="min-w-full border border-gray-200">
    <thead class="bg-gray-100">
      <tr>
        <slot name="head" />
      </tr>
    </thead>
    <tbody>
      <slot />
    </tbody>
  </table>
</template>
<script setup>
// Table component
</script>
