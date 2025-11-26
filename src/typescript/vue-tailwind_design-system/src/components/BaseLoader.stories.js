import BaseLoader from './BaseLoader.vue'

export default {
  title: 'Base/Loader',
  component: BaseLoader,
  argTypes: {
    size: { control: { type: 'select', options: ['sm', 'md', 'lg'] } },
  },
}

const Template = (args) => ({
  components: { BaseLoader },
  setup() {
    return { args }
  },
  template: '<BaseLoader v-bind="args" />',
})

export const Default = Template.bind({})
Default.args = { size: 'md' }

export const Large = Template.bind({})
Large.args = { size: 'lg' }
