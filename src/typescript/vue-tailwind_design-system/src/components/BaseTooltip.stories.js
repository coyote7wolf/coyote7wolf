import BaseTooltip from './BaseTooltip.vue'

export default {
  title: 'Components/BaseTooltip',
  component: BaseTooltip,
  argTypes: {
    text: { control: 'text' },
  },
}

export const Default = (args) => ({
  components: { BaseTooltip },
  setup() {
    return { args }
  },
  template: '<BaseTooltip v-bind="args">滑鼠移到這裡</BaseTooltip>',
})

Default.args = {
  text: '提示文字',
}
