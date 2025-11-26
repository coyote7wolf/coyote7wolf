import BaseProgress from './BaseProgress.vue'

export default {
  title: 'Base/Progress',
  component: BaseProgress,
}

const Template = (args) => ({
  components: { BaseProgress },
  setup() {
    return { args }
  },
  template: '<BaseProgress v-bind="args" />',
})

export const Default = Template.bind({})
Default.args = {
  percent: 60,
  color: 'blue',
}
