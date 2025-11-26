import BaseIcon from './BaseIcon.vue'

export default {
  title: 'Base/Icon',
  component: BaseIcon,
  argTypes: {
    icon: { control: 'text' },
    size: { control: { type: 'select', options: ['sm', 'md', 'lg'] } },
    color: { control: 'text' },
  },
}

const Template = (args) => ({
  components: { BaseIcon },
  setup() {
    return { args }
  },
  template: '<BaseIcon v-bind="args" />',
})

export const Check = Template.bind({})
Check.args = { icon: 'check', size: 'md', color: 'current' }

export const X = Template.bind({})
X.args = { icon: 'x', size: 'md', color: 'red-500' }

export const Info = Template.bind({})
Info.args = { icon: 'info', size: 'lg', color: 'blue-500' }
