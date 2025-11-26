<template>
  <nav class="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
    <template v-for="(item, i) in items">
      <span v-if="i !== 0" class="text-gray-400 dark:text-gray-600">/</span>
      <span v-if="i < items.length - 1">
        <a :href="item.href" class="text-blue-600 hover:underline dark:text-blue-300">{{
          item.label
        }}</a>
      </span>
      <span v-else class="text-gray-700 dark:text-gray-200">{{ item.label }}</span>
    </template>
  </nav>
</template>

<script>
export default {
  name: 'BaseBreadcrumb',
  props: {
    items: {
      type: Array,
      required: true, // [{ label, href }]
    },
  },
}
</script>
