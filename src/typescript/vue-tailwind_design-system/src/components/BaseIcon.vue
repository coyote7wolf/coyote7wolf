<template>
  <span v-if="icon" :class="[sizeClass, colorClass]" v-html="svgIcon" aria-hidden="true"></span>
</template>

<script>
// 這裡可擴充更多 SVG icon
const icons = {
  check: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
  x: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
  info: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16v-4m0-4h.01"/></svg>`,
}

export default {
  name: 'BaseIcon',
  props: {
    icon: { type: String, required: true },
    size: { type: String, default: 'md' }, // sm, md, lg
    color: { type: String, default: 'current' },
  },
  computed: {
    svgIcon() {
      return icons[this.icon] || ''
    },
    sizeClass() {
      return (
        {
          sm: 'w-4 h-4',
          md: 'w-5 h-5',
          lg: 'w-6 h-6',
        }[this.size] || 'w-5 h-5'
      )
    },
    colorClass() {
      return this.color === 'current' ? 'text-current' : `text-${this.color}`
    },
  },
}
</script>

<style scoped>
span {
  display: inline-block;
  vertical-align: middle;
}
</style>
