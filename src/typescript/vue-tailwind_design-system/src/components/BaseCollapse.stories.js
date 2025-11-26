import BaseCollapse from './BaseCollapse.vue'

export default {
  title: 'Base/Collapse',
  component: BaseCollapse,
}

const Template = (args) => ({
  components: { BaseCollapse },
  setup() {
    return { args }
  },
  template: '<BaseCollapse v-bind="args" />',
})

export const Default = Template.bind({})
Default.args = {
  items: [
    { title: 'Section 1', content: 'Content 1' },
    { title: 'Section 2', content: 'Content 2' },
  ],
}
