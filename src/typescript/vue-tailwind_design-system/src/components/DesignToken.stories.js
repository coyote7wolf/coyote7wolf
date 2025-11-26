export default {
  title: 'Design Tokens',
}

const colors = [
  { name: 'primary', value: 'bg-primary' },
  { name: 'secondary', value: 'bg-secondary' },
  { name: 'danger', value: 'bg-danger' },
  { name: 'success', value: 'bg-success' },
  { name: 'warning', value: 'bg-warning' },
  { name: 'info', value: 'bg-info' },
]

export const Colors = () => ({
  template: `
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <div v-for="color in colors" :key="color.name" style="text-align:center;">
        <div :class="color.value + ' w-16 h-16 rounded mb-2'" />
        <div>{{ color.name }}</div>
      </div>
    </div>
  `,
  data() {
    return { colors }
  },
})

export const BorderRadius = () => ({
  template: `
    <div style="display: flex; gap: 2rem;">
      <div style="text-align:center;">
        <div class="bg-primary w-16 h-16 rounded-md mb-2" />
        <div>md (0.375rem)</div>
      </div>
      <div style="text-align:center;">
        <div class="bg-primary w-16 h-16 rounded-lg mb-2" />
        <div>lg (0.5rem)</div>
      </div>
      <div style="text-align:center;">
        <div class="bg-primary w-16 h-16 rounded-full mb-2" />
        <div>full</div>
      </div>
    </div>
  `,
})

export const FontFamily = () => ({
  template: `
    <div>
      <div class="font-sans text-lg">Inter, sans-serif (font-sans)</div>
    </div>
  `,
})
