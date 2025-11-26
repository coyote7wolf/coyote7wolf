<template>
  <div>
    <div v-for="(item, i) in items" :key="i" class="border-b last:border-b-0">
      <button
        class="w-full flex justify-between items-center px-4 py-2 text-left focus:outline-none focus:ring dark:bg-gray-900 dark:text-white bg-white text-gray-900"
        @click="toggle(i)"
      >
        <span>{{ item.title }}</span>
        <span>
          <BaseIcon :icon="open[i] ? 'chevron-up' : 'chevron-down'" />
        </span>
      </button>
      <transition name="accordion">
        <div v-show="open[i]" class="px-4 py-2 bg-gray-50 dark:bg-gray-800">
          <slot :name="'panel-' + i">{{ item.content }}</slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import BaseIcon from './BaseIcon.vue'

export default {
  name: 'BaseCollapse',
  components: { BaseIcon },
  props: {
    items: {
      type: Array,
      required: true, // [{ title, content }]
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      open: this.items.map(() => false),
    }
  },
  methods: {
    toggle(i) {
      if (this.multiple) {
        this.$set(this.open, i, !this.open[i])
      } else {
        this.open = this.open.map((v, idx) => (idx === i ? !v : false))
      }
    },
  },
}
</script>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.3s ease;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  overflow: hidden;
}
</style>
